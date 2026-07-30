<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CheckIn;
use Illuminate\Http\Request;

class CheckInController extends Controller
{
    public function index(Request $request)
    {
        $query = CheckIn::query()->with('program.patient')->latest();

        if ($request->boolean('flagged', false) || $request->query('flagged') === 'true') {
            $query->where('flagged', true);
        }

        if ($request->filled('patient_id')) {
            $query->whereHas('program', fn ($q) => $q->where('patient_id', $request->query('patient_id')));
        }

        return response()->json($query->paginate(50));
    }
}
