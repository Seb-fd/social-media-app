"use client";

import {
  getNotifications,
  markNotificationsAsRead,
  deleteNotification,
} from "@/actions/notifications.action";
import { NotificationsSkeleton } from "@/components/NotificationSkeleton";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { HeartIcon, MessageCircleIcon, UserPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { DeleteAlertDialog } from "@/components/DeleteAlertDialog";

type Notifications = Awaited<ReturnType<typeof getNotifications>>;
type Notification = Notifications[number];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "LIKE":
      return <HeartIcon className="w-5 h-5 text-red-500 fill-current" />;
    case "COMMENT":
      return (
        <MessageCircleIcon className="w-5 h-5 text-blue-500 fill-current" />
      );
    case "FOLLOW":
      return <UserPlusIcon className="w-5 h-5 text-green-500 fill-current" />;
    default:
      return null;
  }
};

function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const data = await getNotifications();
        setNotifications(data);

        const unreadIds = data.filter((n) => !n.read).map((n) => n.id);
        if (unreadIds.length > 0) await markNotificationsAsRead(unreadIds);
      } catch (error) {
        toast.error("Failed to fetch notifications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await deleteNotification(id);
    if (res.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification deleted");
    } else {
      toast.error("Failed to delete notification");
    }
    setDeletingId(null);
  };

  if (isLoading) return <NotificationsSkeleton />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Notifications</CardTitle>
            <span className="text-sm text-muted-foreground">
              {notifications.filter((n) => !n.read).length} unread
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 border-b transition-colors ${
                    !notification.read ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="flex-1 w-full">
                    <div className="flex sm:flex-row items-center sm:items-center mb-2 gap-2 sm:gap-4">
                      <Link
                        href={`/profile/${notification.creator.username}`}
                        className="shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Avatar className="hover:opacity-80 transition">
                          <AvatarImage
                            src={notification.creator.image ?? "/avatar.png"}
                          />
                        </Avatar>
                      </Link>
                      <div className="flex sm:flex-row flex-col sm:items-center gap-2 sm:gap-4 items-start">
                        {getNotificationIcon(notification.type)}

                        <div className="flex flex-col">
                          {notification.creator.name && (
                            <Link
                              href={`/profile/${notification.creator.username}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:underline font-medium text-lg"
                            >
                              {notification.creator.name}
                            </Link>
                          )}

                          <Link
                            href={`/profile/${notification.creator.username}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline text-muted-foreground text-sm"
                          >
                            @{notification.creator.username}
                          </Link>
                        </div>
                      </div>
                      <div className="ml-auto">
                        <DeleteAlertDialog
                          isDeleting={deletingId === notification.id}
                          onDelete={() => handleDelete(notification.id)}
                          title="Delete notification"
                          description="This will remove the notification permanently."
                        />
                      </div>
                    </div>
                    <Link
                      href={getNotificationLink(notification)}
                      className="block pl-0 space-y-2 rounded-md hover:bg-muted/25 p-2 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-sm text-muted-foreground">
                        {notification.type === "FOLLOW"
                          ? "Started following you"
                          : notification.type === "LIKE"
                          ? "Liked your post"
                          : "Commented on your post"}
                      </div>

                      {notification.post &&
                        (notification.type === "LIKE" ||
                          notification.type === "COMMENT") && (
                          <div className="text-sm text-muted-foreground rounded-md p-2 bg-muted/30">
                            <p>{notification.post.content}</p>
                            {notification.post.image && (
                              <img
                                src={notification.post.image}
                                alt="Post content"
                                className="mt-2 rounded-md w-full max-w-[200px] h-auto object-cover"
                              />
                            )}
                          </div>
                        )}

                      {notification.type === "COMMENT" &&
                        notification.comment && (
                          <div className="text-sm p-2 bg-accent/50 rounded-md">
                            {notification.comment.content}
                          </div>
                        )}

                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

const getNotificationLink = (notification: Notification) => {
  switch (notification.type) {
    case "FOLLOW":
      return `/profile/${notification.creator.username}`;
    case "LIKE":
    case "COMMENT":
      return notification.comment
        ? `/post/${notification.post?.id}#comment-${notification.comment.id}`
        : `/post/${notification.post?.id}`;
    default:
      return "#";
  }
};

export default NotificationsPage;
