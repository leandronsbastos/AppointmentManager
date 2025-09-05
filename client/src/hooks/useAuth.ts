import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: authApi.me,
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}
