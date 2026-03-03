// adapters.ts

export function mapGigFromBackend(raw: any) {
  return {
    id: raw.gig_id,
    title: raw.title,
    description: raw.description,
    status: raw.status,
    price: raw.price ?? 500,
    priceType: raw.price_type ?? "Fixed",
    category: raw.category ?? "Tech",
    deadline: raw.deadline ?? new Date(Date.now() + 3 * 86400000).toISOString(),
    skillTags: raw.skill_tags ?? raw.skills ?? [],
    postedBy: {
      id: raw.posted_by,
      name: raw.posted_by_name ?? "Student",
      rating: raw.posted_by_rating ?? 4.5,
    },
  };
}

export function mapUserFromBackend(raw: any) {
  return {
    id: raw.user_id,
    name: raw.name,
    rating: raw.rating ?? 0,
    readiness: raw.job_readiness_score ?? 0,
    department: raw.department,
    skills: raw.skills ?? [],
  };
}