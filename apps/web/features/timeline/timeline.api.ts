import { api } from "@/services/api"
import type { components } from "@weavit/api-types"

type Timeline = components["schemas"]["Timeline"]
type CalendarSource = components["schemas"]["CalendarSource"]
type CalendarEvent = components["schemas"]["CalendarEvent"]
type CreateCalendarSourceInput = components["schemas"]["CreateCalendarSourceInput"]
type UpdateCalendarSourceInput = components["schemas"]["UpdateCalendarSourceInput"]
type CreateCalendarEventInput = components["schemas"]["CreateCalendarEventInput"]
type UpdateCalendarEventInput = components["schemas"]["UpdateCalendarEventInput"]

export const timelineApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getTimeline: builder.query<Timeline, void>({
      query: () => "/timeline",
      providesTags: ["Timeline"],
    }),

    getCalendars: builder.query<CalendarSource[], void>({
      query: () => "/calendars",
      providesTags: ["Calendar"],
    }),

    postCalendar: builder.mutation<CalendarSource, CreateCalendarSourceInput>({
      query: (body) => ({
        url: "/calendars",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Timeline", "Calendar"],
    }),

    patchCalendar: builder.mutation<
      CalendarSource,
      { id: string; body: UpdateCalendarSourceInput }
    >({
      query: ({ id, body }) => ({
        url: `/calendars/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Timeline", "Calendar"],
    }),

    deleteCalendar: builder.mutation<void, string>({
      query: (id) => ({
        url: `/calendars/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Timeline", "Calendar"],
    }),

    getCalendarEvents: builder.query<CalendarEvent[], void>({
      query: () => "/calendar-events",
      providesTags: ["CalendarEvent"],
    }),

    postCalendarEvent: builder.mutation<CalendarEvent, CreateCalendarEventInput>({
      query: (body) => ({
        url: "/calendar-events",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Timeline", "CalendarEvent"],
    }),

    patchCalendarEvent: builder.mutation<
      CalendarEvent,
      { id: string; body: UpdateCalendarEventInput }
    >({
      query: ({ id, body }) => ({
        url: `/calendar-events/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Timeline", "CalendarEvent"],
    }),

    deleteCalendarEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/calendar-events/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Timeline", "CalendarEvent"],
    }),
  }),
})

export const {
  useGetTimelineQuery,
  useGetCalendarsQuery,
  usePostCalendarMutation,
  usePatchCalendarMutation,
  useDeleteCalendarMutation,
  useGetCalendarEventsQuery,
  usePostCalendarEventMutation,
  usePatchCalendarEventMutation,
  useDeleteCalendarEventMutation,
} = timelineApi
