def calculate_job_readiness(user: "User") -> int:
    gig_score = min(user.total_gigs_completed * 20, 40)
    rating_score = (user.rating / 5) * 30
    skill_score = min(len(user.skills) * 3, 20)
    referral_bonus = min(user.referral_count * 2, 10)
    return min(round(gig_score + rating_score + skill_score + referral_bonus), 100)