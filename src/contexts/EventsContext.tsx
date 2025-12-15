/* @refresh reset */
import type { LandingEvent } from "@/types/content";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { createContext, type ReactNode, useContext } from "react";
import { supabaseClient } from "../supabase/client";
import type { TablesInsert, TablesUpdate } from "../supabase/types";
import {
  cleanupEventAssets,
  cleanupGalleryAsset,
} from "../utils/storageHelpers";

interface EventsContextType {
  events: LandingEvent[];
  loading: boolean;
  error: string | null;
  addEvent: (event: TablesInsert<"events">) => Promise<LandingEvent>;
  updateEvent: (
    id: string,
    updates: TablesUpdate<"events">
  ) => Promise<LandingEvent>;
  deleteEvent: (id: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();

  const fetchEvents = async (): Promise<LandingEvent[]> => {
    const { data, error } = await supabaseClient
      .from("public_events_view")
      .select("*")
      .order("start_date", { ascending: true });

    if (error) throw error;

    return (data || []).map((row: any): LandingEvent => {
      // Map database status to LandingEvent status
      let status: LandingEvent["status"] = "upcoming";
      if (row.status === "published") {
        const now = new Date();
        const startDate = row.start_date ? new Date(row.start_date) : null;
        const endDate = row.end_date ? new Date(row.end_date) : null;
        if (startDate && endDate && now >= startDate && now <= endDate) {
          status = "ongoing";
        } else if (endDate && now > endDate) {
          status = "completed";
        } else {
          status = "upcoming";
        }
      } else if (row.status === "ongoing") {
        status = "ongoing";
      } else if (
        row.status === "completed" ||
        row.status === "cancelled" ||
        row.status === "archived"
      ) {
        status = "completed";
      }

      return {
        id: row.id ?? "",
        title: row.title ?? "",
        description: row.description ?? null,
        date: row.date ?? row.start_date ?? "",
        time: row.time ?? "",
        venue: row.venue ?? row.location ?? "",
        venueAddress: row.venue_address ?? row.address ?? "",
        image: row.image ?? row.image_url ?? row.featured_image ?? "",
        category: row.category ?? null,
        status,
        end_date: row.end_date ?? "",
        capacity: row.capacity || row.max_attendees || undefined,
        attendees: row.attendees || row.current_attendees || null,
        price: (() => {
          const metadata = row.metadata || {};
          if (metadata.price_range) return metadata.price_range;
          if (row.price) return `${row.currency || "IDR"} ${row.price}`;
          return null;
        })(),
        price_range: (() => {
          const metadata = row.metadata || {};
          if (metadata.price_range) return metadata.price_range;
          return row.price_range || null;
        })(),
        ticket_url: (() => {
          const metadata = row.metadata || {};
          if (metadata.ticket_url) return metadata.ticket_url;
          return row.ticket_url || null;
        })(),
        artists: (() => {
          const metadata = row.metadata || {};
          if (metadata.artists && Array.isArray(metadata.artists)) {
            return metadata.artists.map((artist: any) => ({
              name: artist.name || artist || "",
              role: artist.role || undefined,
              image: artist.image || undefined,
            }));
          }
          if (row.artists && Array.isArray(row.artists)) {
            return row.artists.map((name: string) => ({
              name: typeof name === "string" ? name : "",
              role: undefined,
              image: undefined,
            }));
          }
          return [];
        })(),
        gallery: (() => {
          if (row.gallery_images_urls) {
            try {
              if (Array.isArray(row.gallery_images_urls))
                return row.gallery_images_urls;
              if (typeof row.gallery_images_urls === "string")
                return JSON.parse(row.gallery_images_urls);
              return row.gallery_images_urls;
            } catch (e) {
              console.error("Error parsing gallery_images_urls:", e);
            }
          }
          return row.gallery || [];
        })(),
        highlights: (() => {
          const metadata = row.metadata || {};
          if (metadata.highlights && Array.isArray(metadata.highlights))
            return metadata.highlights;
          return row.highlights || [];
        })(),
        start_date: row.start_date,
        location: row.location || null,
        partner_name: row.partner_name || null,
        partner_logo_url: row.partner_logo_url || null,
        metadata: row.metadata ?? {},
        created_at: row.created_at,
        updated_at: row.updated_at,
        tags: row.tags || null,
        image_url: row.image_url || row.image || null,
        currency: row.currency || null,
      };
    }) as LandingEvent[];
  };

  const {
    data: events = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const addEventMutation = useMutation({
    mutationFn: async (event: TablesInsert<"events">) => {
      const { data, error } = await supabaseClient
        .from("events")
        .insert(event)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from insert operation");

      // We need to refetch to get the full view data
      return data as unknown as LandingEvent; // Temporary cast, real data comes from refetch
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: TablesUpdate<"events">;
    }) => {
      const { data, error } = await supabaseClient
        .from("events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from update operation");

      return data as unknown as LandingEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      // First, get the event to find out about associated images
      const { data: eventToDelete, error: fetchError } = await supabaseClient
        .from("events")
        .select("metadata")
        .eq("id", id)
        .single();

      if (fetchError)
        console.error("Error fetching event for deletion:", fetchError);

      // Fetch associated gallery items to clean up their assets later
      const { data: galleryItems, error: galleryFetchError } =
        await supabaseClient
          .from("gallery_items")
          .select("image_url")
          .eq("event_id", id);

      if (galleryFetchError)
        console.error(
          "Error fetching gallery items for deletion:",
          galleryFetchError
        );

      // Delete associated gallery items first (to satisfy Foreign Key constraints)
      const { error: galleryDeleteError } = await supabaseClient
        .from("gallery_items")
        .delete()
        .eq("event_id", id);

      if (galleryDeleteError) throw galleryDeleteError;

      // Now delete the event
      const { error: deleteError } = await supabaseClient
        .from("events")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      // Cleanup assets
      if (eventToDelete?.metadata) {
        await cleanupEventAssets(eventToDelete.metadata);
      }

      if (galleryItems && galleryItems.length > 0) {
        const galleryUrls = galleryItems.map(
          (item: { image_url: string }) => item.image_url
        );
        // We need to import this function
        await cleanupGalleryAsset(galleryUrls);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const value = {
    events,
    loading,
    error: queryError ? (queryError as Error).message : null,
    addEvent: async (event: TablesInsert<"events">) => {
      await addEventMutation.mutateAsync(event);
      // Return a placeholder or fetch the specific event if needed
      // For now, we rely on invalidation to update the list
      const result = await refetch();
      return result.data?.find((e) => e.title === event.title) as LandingEvent;
    },
    updateEvent: async (id: string, updates: TablesUpdate<"events">) => {
      await updateEventMutation.mutateAsync({ id, updates });
      const result = await refetch();
      return result.data?.find((e) => e.id === id) as LandingEvent;
    },
    deleteEvent: async (id: string) => {
      await deleteEventMutation.mutateAsync(id);
    },
    refreshEvents: async () => {
      await refetch();
    },
  };

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) throw new Error("useEvents must be used within EventsProvider");
  return context;
};
