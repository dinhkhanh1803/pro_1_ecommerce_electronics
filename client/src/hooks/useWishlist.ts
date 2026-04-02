import { useState, useEffect, useCallback } from "react";

const API = `${import.meta.env.VITE_API_URL}/api`;

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch danh sách ID sản phẩm trong wishlist
  const fetchWishlistIds = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/users/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setWishlistIds(data.map((p: any) => p._id || p));
      }
    } catch {
      // ignore
    }
  }, [token]);

  useEffect(() => {
    fetchWishlistIds();
  }, [fetchWishlistIds]);

  // Toggle (thêm/xóa) 1 sản phẩm
  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (!token) {
      alert("Bạn cần đăng nhập để thêm vào yêu thích");
      return false;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/users/wishlist/${productId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.wishlisted) {
        setWishlistIds((prev) => [...prev, productId]);
      } else {
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
      }
      return data.wishlisted;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Xóa khỏi wishlist
  const removeFromWishlist = async (productId: string) => {
    if (!token) return;
    try {
      await fetch(`${API}/users/wishlist/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
    } catch {
      // ignore
    }
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  return { wishlistIds, loading, toggleWishlist, removeFromWishlist, isWishlisted, refetch: fetchWishlistIds };
}
