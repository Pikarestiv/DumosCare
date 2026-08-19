<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckInController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MonitoringProgramController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\PatientReportController;
use App\Http\Controllers\Api\ReminderController;
use App\Http\Controllers\Api\WhatsAppWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// WhatsApp Cloud API webhook (public, verified via Meta's verify token / signature).
Route::get('/webhooks/whatsapp', [WhatsAppWebhookController::class, 'verify']);
Route::post('/webhooks/whatsapp', [WhatsAppWebhookController::class, 'handle']);

// Public, token-scoped patient reporting page.
Route::get('/report/{token}', [PatientReportController::class, 'show']);
Route::post('/report/{token}', [PatientReportController::class, 'store']);

// Dashboard auth (Sanctum SPA/cookie based).
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Admin API (Sanctum-protected).
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
    Route::get('/dashboard/analytics', [DashboardController::class, 'analytics']);

    Route::get('/check-ins', [CheckInController::class, 'index']);

    Route::apiResource('patients', PatientController::class)->except(['show'])->parameters(['patients' => 'patient']);
    Route::get('/patients/{patient}', [PatientController::class, 'show']);

    Route::post('/patients/{patient}/programs', [MonitoringProgramController::class, 'store']);
    Route::patch('/programs/{program}', [MonitoringProgramController::class, 'update']);
    Route::delete('/programs/{program}', [MonitoringProgramController::class, 'destroy']);

    Route::get('/reminders', [ReminderController::class, 'index']);
    Route::post('/programs/{program}/reminders', [ReminderController::class, 'store']);
    Route::patch('/reminders/{reminder}', [ReminderController::class, 'update']);
    Route::delete('/reminders/{reminder}', [ReminderController::class, 'destroy']);
});
