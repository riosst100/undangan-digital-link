<?php

namespace App\Policies;

use App\Models\Invitation;
use App\Models\User;

class InvitationPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Invitation $invitation): bool
    {
        return $user->isAdmin() || $invitation->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Invitation $invitation): bool
    {
        return $invitation->user_id === $user->id;
    }

    public function delete(User $user, Invitation $invitation): bool
    {
        return $invitation->user_id === $user->id;
    }

    public function restore(User $user, Invitation $invitation): bool
    {
        return $invitation->user_id === $user->id;
    }

    public function forceDelete(User $user, Invitation $invitation): bool
    {
        return $user->isAdmin();
    }
}
