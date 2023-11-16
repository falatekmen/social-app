import {AppBskyFeedGetActorFeeds} from '@atproto/api'
import {useInfiniteQuery, InfiniteData, QueryKey} from '@tanstack/react-query'

import {useSession} from '#/state/session'
import {STALE} from '#/state/queries'

const PAGE_SIZE = 30
type RQPageParam = string | undefined

// TODO refactor invalidate on mutate?
export const RQKEY = (did: string) => ['profile-feedgens', did]

export function useProfileFeedgensQuery(
  did: string,
  opts?: {enabled?: boolean},
) {
  const {agent} = useSession()
  const enabled = opts?.enabled !== false
  return useInfiniteQuery<
    AppBskyFeedGetActorFeeds.OutputSchema,
    Error,
    InfiniteData<AppBskyFeedGetActorFeeds.OutputSchema>,
    QueryKey,
    RQPageParam
  >({
    staleTime: STALE.INFINITY,
    queryKey: RQKEY(did),
    async queryFn({pageParam}: {pageParam: RQPageParam}) {
      const res = await agent.app.bsky.feed.getActorFeeds({
        actor: did,
        limit: PAGE_SIZE,
        cursor: pageParam,
      })
      return res.data
    },
    initialPageParam: undefined,
    getNextPageParam: lastPage => lastPage.cursor,
    enabled,
  })
}