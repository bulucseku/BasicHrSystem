package Utils

class CoalesceNull[A <: AnyRef](a: A) { def ??(b: A) = if (a == null) b else a }
// 
// implicit def coalesce_anything[A <: AnyRef](a: A) = new CoalesceNull(a)