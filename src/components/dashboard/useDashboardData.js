import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";

/**
 * The dashboard's data in one place. Each request settles independently so a
 * failing circulars feed cannot blank out the course list or the metric tiles.
 */
export function useDashboardData() {
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [certificatesCount, setCertificatesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    const [coursesRes, annRes, certRes] = await Promise.allSettled([
      api.get("/courses"),
      api.get("/announcements?limit=3"),
      api.get("/certificates/my"),
    ]);

    if (coursesRes.status === "fulfilled") {
      const res = coursesRes.value;
      setCourses(Array.isArray(res) ? res : res?.courses || res?.data || []);
    } else {
      setCourses([]);
    }

    if (annRes.status === "fulfilled") {
      const res = annRes.value;
      const list = Array.isArray(res)
        ? res
        : res?.announcements || res?.data?.announcements || res?.data || [];
      setAnnouncements(list.slice(0, 3));
    } else {
      setAnnouncements([]);
    }

    if (certRes.status === "fulfilled") {
      const res = certRes.value;
      const list = Array.isArray(res)
        ? res
        : res?.certificates || res?.data?.certificates || res?.data || [];
      setCertificatesCount(list.length);
    } else {
      setCertificatesCount(0);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { courses, announcements, certificatesCount, loading, reload: load };
}

export function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
