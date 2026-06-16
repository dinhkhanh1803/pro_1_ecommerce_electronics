import {
  ActivityIcon,
  UsersIcon,
  PackageIcon,
  ShoppingBagIcon,
  LayoutTemplateIcon,
  BarChart2Icon,
  TagIcon,
  StarIcon,
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
    icon: BarChart2Icon,
    label: "Tổng quan",
    path: "/seller/dashboard",
  },
  {
    icon: PackageIcon,
    label: "Sản phẩm",
    path: "/seller/products",
  },
  {
    icon: ShoppingBagIcon,
    label: "Đơn hàng",
    path: "/seller/orders",
  },
  {
    icon: TagIcon,
    label: "Khuyến mãi",
    path: "/seller/promotions",
  },
  {
    icon: StarIcon,
    label: "Đánh giá",
    path: "/seller/reviews",
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
