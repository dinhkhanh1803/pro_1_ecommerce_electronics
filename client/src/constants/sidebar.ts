import {
  ActivityIcon,
  UsersIcon,
  PackageIcon,
  ShoppingBagIcon,
  LayoutTemplateIcon,
  TagIcon,
  MessageSquareIcon,
  TruckIcon,
  UserIcon,
  DollarSignIcon,
} from "lucide-react";

export const ADMIN_SIDEBAR = [
  {
    icon: ActivityIcon,
    label: "Tổng quan",
    path: "/admin/dashboard",
  },
  {
    icon: UsersIcon,
    label: "Người dùng",
    path: "/admin/users",
  },
  {
    icon: PackageIcon,
    label: "Danh mục",
    path: "/admin/categories",
  },
  {
    icon: PackageIcon,
    label: "Sản phẩm",
    path: "/admin/products",
  },
  {
    icon: ShoppingBagIcon,
    label: "Đơn hàng",
    path: "/admin/orders",
  },
  {
    icon: TagIcon,
    label: "Mã giảm giá",
    path: "/admin/promotions",
  },
  {
    icon: LayoutTemplateIcon,
    label: "CMS",
    path: "/admin/cms",
  },
  {
    icon: MessageSquareIcon,
    label: "Tin nhắn",
    path: "/admin/messages",
  },
];

export const SELLER_SIDEBAR = [
  {
    icon: ShoppingBagIcon,
    label: "Đơn hàng",
    path: "/seller/orders",
  },
  {
    icon: MessageSquareIcon,
    label: "Tin nhắn",
    path: "/seller/messages",
  },
];

export const SHIPPER_SIDEBAR = [
  {
    icon: TruckIcon,
    label: "Giao hàng",
    path: "/shipper/deliveries",
  },
  {
    icon: DollarSignIcon,
    label: "Thu/Nộp COD",
    path: "/shipper/cod",
  },
  {
    icon: UserIcon,
    label: "Hồ sơ",
    path: "/shipper/profile",
  },
];

export const WAREHOUSE_SIDEBAR = [
  {
    icon: ActivityIcon,
    label: "Tổng quan",
    path: "/warehouse/dashboard",
  },
  {
    icon: PackageIcon,
    label: "Sản phẩm",
    path: "/warehouse/products",
  },
  {
    icon: TagIcon,
    label: "Khuyến mãi",
    path: "/warehouse/promotions",
  },
];
