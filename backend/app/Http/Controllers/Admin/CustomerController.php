<?php

namespace App\Http\Controllers\Admin;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\CustomerResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    use ApiResponses;

    public function index(): JsonResponse
    {
        $customers = User::query()
            ->where('role', 'customer')
            ->withCount('invitations')
            ->latest('created_at')
            ->get();

        return $this->success(CustomerResource::collection($customers));
    }
}
