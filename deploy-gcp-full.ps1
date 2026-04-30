# ============================================================
# TrackOrder - Script de Deploiement COMPLET (Min awel w jdid)
# Projet: gestion-de-livraison-493711
# ============================================================

param(
    [string]$ProjectId     = "gestion-de-livraison-493711",
    [string]$ClusterName   = "trackorder-cluster",
    [string]$Zone          = "europe-west1-b",
    [string]$Tag           = "prod",
    [string]$Namespace     = "trackorder-prod"
)

$ErrorActionPreference = "Continue"

function Check-Error {
    param([string]$Msg)
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "ERREUR: $Msg" -ForegroundColor Red
        Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  TrackOrder - Deploiement COMPLET (A a Z)"  -ForegroundColor Cyan
Write-Host "  Projet : $ProjectId"                       -ForegroundColor Cyan
Write-Host "  Cluster: $ClusterName"                     -ForegroundColor Cyan
Write-Host "  Zone   : $Zone"                            -ForegroundColor Cyan
Write-Host "  Tag    : $Tag"                             -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ---------- Etape 1 : Verification des prerequis ----------
Write-Host "[1/8] Verification des prerequis..." -ForegroundColor Yellow

foreach ($tool in @("gcloud", "docker", "kubectl")) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Host "ERREUR: '$tool' n'est pas installe ou pas dans le PATH." -ForegroundColor Red
        exit 1
    }
}
Write-Host "  OK - gcloud, docker, kubectl trouves." -ForegroundColor Green

# ---------- Etape 2 : Configuration GCP ----------
Write-Host "[2/8] Configuration du projet GCP..." -ForegroundColor Yellow

gcloud config set project $ProjectId 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
gcloud config set compute/zone $Zone 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }

Write-Host "  Activation des APIs GCP..." -ForegroundColor Gray
$apis = @(
    "container.googleapis.com",
    "containerregistry.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com"
)
foreach ($api in $apis) {
    Write-Host "    Activation: $api" -ForegroundColor DarkGray
    gcloud services enable $api --quiet 2>&1 | Out-Null
}

Write-Host "  Configuration de Docker pour GCR..." -ForegroundColor Gray
gcloud auth configure-docker --quiet 2>&1 | Out-Null
Write-Host "  OK - Projet configure." -ForegroundColor Green

# ---------- Etape 3 : Build des images Docker ----------
$backendImage  = "gcr.io/$ProjectId/backend:$Tag"
$frontendImage = "gcr.io/$ProjectId/frontend:$Tag"

Write-Host "[3/8] Build des images Docker..." -ForegroundColor Yellow

Write-Host "  Building backend -> $backendImage" -ForegroundColor Gray
docker build -t $backendImage ./backend
Check-Error "Build backend echoue."

Write-Host "  Building frontend -> $frontendImage" -ForegroundColor Gray
docker build -t $frontendImage ./frontend
Check-Error "Build frontend echoue."

Write-Host "  OK - Images buildees." -ForegroundColor Green

# ---------- Etape 4 : Push vers GCR ----------
Write-Host "[4/8] Push des images vers GCR..." -ForegroundColor Yellow

Write-Host "  Pushing $backendImage" -ForegroundColor Gray
docker push $backendImage
Check-Error "Push backend echoue. Verifiez: gcloud auth configure-docker"

Write-Host "  Pushing $frontendImage" -ForegroundColor Gray
docker push $frontendImage
Check-Error "Push frontend echoue."

Write-Host "  OK - Images pushees vers GCR." -ForegroundColor Green

# ---------- Etape 5 : Creer le cluster GKE ----------
Write-Host "[5/8] Creation du cluster GKE..." -ForegroundColor Yellow

$clusterList = (gcloud container clusters list --zone $Zone --format="value(name)" 2>$null)
$clusterExists = $clusterList | Where-Object { $_.Trim() -eq $ClusterName }

if ($clusterExists) {
    Write-Host "  Le cluster '$ClusterName' existe deja. Skip creation." -ForegroundColor DarkGray
} else {
    Write-Host "  Creation en cours (5-10 minutes)..." -ForegroundColor Gray
    gcloud container clusters create $ClusterName `
        --zone $Zone `
        --num-nodes=3 `
        --machine-type=e2-medium `
        --disk-size=30 `
        --enable-autorepair `
        --enable-autoupgrade `
        --enable-autoscaling --min-nodes=2 --max-nodes=5 `
        --monitoring=SYSTEM `
        --logging=SYSTEM `
        --quiet 2>&1 | Write-Host
    Check-Error "Creation du cluster echouee."
}
Write-Host "  OK - Cluster pret." -ForegroundColor Green


# ---------- Etape 6 : Connecter kubectl au cluster ----------
Write-Host "[6/8] Connexion kubectl au cluster..." -ForegroundColor Yellow

gcloud container clusters get-credentials $ClusterName --zone $Zone 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
Check-Error "Impossible de recuperer les credentials du cluster."

kubectl cluster-info 2>&1 | Select-Object -First 3 | Write-Host
Write-Host "  OK - kubectl connecte." -ForegroundColor Green

# ---------- Etape 7 : Deployer avec Kustomize ----------
Write-Host "[7/8] Deploiement avec Kustomize (overlay prod)..." -ForegroundColor Yellow

# Creer le namespace s'il n'existe pas
kubectl create namespace $Namespace --dry-run=client -o yaml 2>&1 | kubectl apply -f - 2>&1 | Write-Host

# Appliquer la configuration Kustomize prod
kubectl apply -k kubernetes/overlays/prod
Check-Error "Deploiement Kustomize echoue."
Write-Host "  OK - Ressources deployees." -ForegroundColor Green

# ---------- Etape 8 : Verification ----------
Write-Host "[8/8] Verification du deploiement..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Attente du demarrage des pods (timeout 120s)..." -ForegroundColor Gray
kubectl rollout status deployment/postgres-deployment  -n $Namespace --timeout=120s
kubectl rollout status deployment/backend-deployment   -n $Namespace --timeout=120s
kubectl rollout status deployment/frontend-deployment  -n $Namespace --timeout=120s

Write-Host ""
Write-Host "--- PODS ---" -ForegroundColor Cyan
kubectl get pods -n $Namespace -o wide

Write-Host ""
Write-Host "--- SERVICES ---" -ForegroundColor Cyan
kubectl get services -n $Namespace

# Attendre l'IP externe du LoadBalancer
Write-Host ""
Write-Host "  Attente de l'IP externe du LoadBalancer (max 90s)..." -ForegroundColor Gray
$maxWait = 90
$waited  = 0
$externalIp = ""
do {
    $externalIp = (kubectl get svc frontend-service -n $Namespace -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>$null)
    if ($externalIp) { break }
    Start-Sleep -Seconds 5
    $waited += 5
    Write-Host "  ... en attente ($waited/$maxWait s)..." -ForegroundColor DarkGray
} while ($waited -lt $maxWait)

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  DEPLOIEMENT TERMINE AVEC SUCCES !"        -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
if ($externalIp) {
    Write-Host "  Application accessible sur :"          -ForegroundColor White
    Write-Host "  http://${externalIp}:4200"             -ForegroundColor Cyan
} else {
    Write-Host "  IP externe pas encore disponible."     -ForegroundColor Yellow
    Write-Host "  Verifiez: kubectl get svc frontend-service -n $Namespace" -ForegroundColor Yellow
}
Write-Host ""
