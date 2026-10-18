# SnapShare: Scaling Plan

SnapShare is a photo-sharing app. Users upload photos and scroll a feed of photos from people they follow.

## 1. Assumptions

Given:

- 10,000,000 registered users
- 10% are active each day
- Each active user uploads 1 photo per day
- Each active user views 50 feed pages per day
- Average photo: 2 MB. Each photo also gets a 50 KB thumbnail

My additional assumptions:

- Activity is spread over 24 hours on average (86,400 seconds per day), but peak traffic is 5x the average.
- 1 MB = 1,000,000 bytes, 1 TB = 1,000,000 MB (decimal units, to keep the math simple).
- One "feed page view" is one request to the feed API, and each returns a page of thumbnails plus metadata.
- Photo metadata (user id, caption, timestamp, file location) is tiny (about 1 KB per photo) compared to the photo files, so it is ignored in the storage estimate.
- Photos are never deleted (worst case for storage).

## 2. Estimates

### Daily active users (DAU)

```
DAU = 10,000,000 x 10% = 1,000,000 users per day
```

### Uploads per second

```
Uploads per day     = 1,000,000 users x 1 photo      = 1,000,000 uploads/day
Average uploads/sec = 1,000,000 / 86,400             ~ 11.6 uploads/sec
Peak uploads/sec    = 11.6 x 5                       ~ 58 uploads/sec
```

Peak upload bandwidth: 58 x 2 MB ~ 116 MB/s (about 0.93 Gbit/s).

### Feed views per second

```
Feed views per day  = 1,000,000 users x 50           = 50,000,000 views/day
Average views/sec   = 50,000,000 / 86,400            ~ 579 views/sec
Peak views/sec      = 579 x 5                        ~ 2,894 views/sec (about 2,900)
```

### Photo storage per year

```
Originals per day   = 1,000,000 x 2 MB               = 2,000,000 MB = 2 TB/day
Thumbnails per day  = 1,000,000 x 50 KB              = 50 GB/day
Total per day       = 2 TB + 0.05 TB                 = 2.05 TB/day

Originals per year  = 2 TB x 365                     = 730 TB
Thumbnails per year = 0.05 TB x 365                  ~ 18.25 TB
Total per year                                       ~ 748 TB (about 0.75 PB)
```

### Summary table

| Metric | Average | Peak (5x) |
|---|---|---|
| Daily active users | 1,000,000 | n/a |
| Uploads per second | ~11.6 | ~58 |
| Feed views per second | ~579 | ~2,900 |
| Photo storage per year | ~748 TB (730 TB originals + 18 TB thumbnails) | n/a |

## 3. Read-heavy or write-heavy?

**SnapShare is read-heavy.** There are 50,000,000 feed views per day versus 1,000,000 uploads per day, a read-to-write ratio of about **50 : 1**. Peak reads (~2,900/sec) are 50 times peak writes (~58/sec).

What that means for the design:

- **Optimize the read path first.** Put a CDN in front of the photos, a cache in front of the database, and read replicas behind it so most feed requests never touch the primary database.
- **Writes can be slower and asynchronous.** A user can wait a moment for a thumbnail to appear, so heavy work (resizing) goes onto a queue instead of blocking the upload request.
- **Accept eventual consistency.** A new photo showing up a few seconds late in a follower's feed is fine, which allows aggressive caching and replica reads.
- **Scale the parts independently.** Read capacity (cache, replicas, CDN) can grow without growing write capacity.

Note that storage is still a big concern (~0.75 PB per year), even though the request rate is low on the write side. That is a different problem from read traffic and is handled by object storage.

## 4. Why photos should not be stored in the database

A photo is a large binary file (2 MB), while a database row is meant to hold small structured data. Storing photos inside the database is a bad idea because:

- **It bloats the database.** 730 TB of originals per year would dwarf the actual metadata and make backups, replication, and restores extremely slow and expensive.
- **It wastes expensive resources.** Database storage and I/O cost much more than object storage, and large blobs push useful rows out of memory caches.
- **It slows everything down.** Serving 2 MB files through the database ties up connections that should serve fast queries.
- **It does not work with a CDN.** A CDN fetches files by URL from a storage origin, not from SQL queries.

**Instead:** photo files (originals and thumbnails) go into **object storage** (such as Amazon S3 or similar). The database stores only the **metadata**: photo id, owner id, caption, upload time, processing status, and the object storage key/URL of the file.

## 5. Architecture diagram

```
                              +-----------------+
                              |  Users (mobile  |
                              |   app / web)    |
                              +--------+--------+
                                       |
              +------------------------+-----------------------+
              | photo/thumbnail downloads                      | API requests
              v                                                v
     +-----------------+                              +-----------------+
     |       CDN       |                              |  Load Balancer  |
     | (edge caching)  |                              +--------+--------+
     +--------+--------+                                       |
              | cache miss                          +----------+----------+
              |                                     |                     |
              |                                     v                     v
              |                             +--------------+      +--------------+
              |                             | App Server 1 | ...  | App Server N |
              |                             +------+-------+      +------+-------+
              |                                    |                     |
              |          +-------------------------+---------------------+
              |          |                         |                     |
              |          v                         v                     v
              |   +-------------+        +------------------+     +---------------+
              |   |    Cache    |        |   Primary DB     |     |     Queue     |
              |   |  (Redis)    |        |   (writes)       |     | (thumbnail    |
              |   | feeds,      |        +--------+---------+     |   jobs)       |
              |   | metadata    |                 | replication   +-------+-------+
              |   +------+------+                 v                       |
              |          | cache miss     +------------------+            v
              |          +--------------> |   Read Replica   |    +---------------+
              |                           |   (feed reads)   |    | Thumbnail     |
              |                           +------------------+    | Worker(s)     |
              |                                                   +-------+-------+
              |                                                           |
              |        +--------------------------------------+           |
              +------> |           Object Storage             | <---------+
                       |  originals (2 MB) + thumbnails (50KB)|  read original,
                       +--------------------------------------+  write thumbnail
                                        ^
                                        | upload original
                                        +---- App Server (or direct upload)
```

## 6. Components: one sentence each

- **CDN:** Serves photos and thumbnails from servers close to the user, which solves slow image loading and keeps most image traffic away from our own servers and storage.
- **Load balancer:** Spreads incoming requests across many app servers, which solves the problem of one server being overloaded and removes a single point of failure.
- **App servers:** Run the application logic (login, upload, feed building) and are stateless, which solves the problem of scaling compute by simply adding more identical servers.
- **Cache (Redis):** Keeps hot data such as feeds and photo metadata in memory, which solves the problem of the database being hit by about 2,900 repeated reads per second at peak.
- **Database (primary):** Stores structured data such as users, follows, and photo metadata reliably and handles all writes, which solves the problem of durable, queryable data.
- **Read replica:** Holds a copy of the primary database to answer feed read queries, which solves the problem of the 50:1 read load overwhelming the primary.
- **Object storage:** Stores the photo files (originals and thumbnails) cheaply and durably at petabyte scale, which solves the problem of storing ~748 TB per year, something a database cannot do well.
- **Queue:** Holds thumbnail jobs until workers are ready, which solves the problem of upload requests being slowed down by heavy work and lets us absorb upload spikes.
- **Thumbnail worker:** Takes jobs from the queue and creates the 50 KB thumbnail from the 2 MB original, which solves the problem of feeds loading slowly if they had to download full-size photos.

## 7. Upload flow, step by step

1. The user picks a photo in the app and taps "Post". The request goes to the **load balancer**.
2. The load balancer forwards it to one of the **app servers**.
3. The app server checks the user is logged in and validates the file (type is an image, size is within limits).
4. The app server stores the **original photo (2 MB)** in **object storage** and gets back a storage key. (Alternatively, the app server gives the client a temporary pre-signed URL so the client uploads straight to object storage and the server never handles the file bytes.)
5. The app server writes a new row to the **primary database**: photo id, user id, caption, time, storage key, and status = `processing`.
6. The app server puts a **thumbnail job** on the **queue** (message contains the photo id and storage key).
7. The app server immediately replies "upload successful" to the user. The user does not wait for the thumbnail.
8. A **thumbnail worker** takes the job from the queue, reads the original from object storage, and creates a **50 KB thumbnail**.
9. The worker saves the thumbnail in object storage and updates the database row to status = `ready` with the thumbnail key.
10. The worker (or app) clears or updates the relevant **cache** entries (for example, the feeds of followers) so the new photo can show up.
11. When followers load their feed, they get the metadata through the cache/read replica and download the thumbnail through the **CDN**. The first request is a CDN miss that fetches from object storage; later requests are served from the CDN edge.
12. If the worker fails, the job is retried (the message returns to the queue); jobs that keep failing go to a dead-letter queue for inspection.

## 8. Trade-offs

1. **Asynchronous thumbnails (queue) vs. instant results.** Moving resizing to a queue keeps uploads fast and lets the system handle spikes, but the thumbnail is not ready immediately, so the app may briefly show a placeholder or the photo may appear in feeds a few seconds late. It also adds more parts to run and monitor (queue, workers, retries).

2. **Caching vs. freshness.** The cache and CDN make feeds very fast and cut database load, but cached data can be stale: a new photo or a deleted photo may not show up immediately everywhere. We accept eventual consistency because a feed that is a few seconds old is fine, but it makes cache invalidation more complex.

3. **Read replica (replication lag) vs. consistency.** Replicas let us scale reads, but they lag slightly behind the primary, so a user might upload a photo and not see it in their own feed right away. A common fix is to read a user's own recent posts from the primary (or cache), which adds complexity.

4. **CDN and object storage cost vs. performance.** A CDN makes image loading fast worldwide, but its bandwidth costs money, and storing ~748 TB per year is a large ongoing bill. We could reduce cost by moving old photos to cheaper cold storage, at the price of slower access to old photos.

5. **Direct-to-storage upload vs. upload through app servers.** Having the client upload straight to object storage takes the 116 MB/s peak load off the app servers, but it makes validation and security (pre-signed URLs, checking files afterward) harder. Uploading through the server is simpler and gives full control, but it uses much more server bandwidth.

## 9. Conclusion

SnapShare is **read-heavy (about 50 : 1)** with modest write rates (~12 uploads/sec average, ~58 peak) but large storage growth (~748 TB per year). The design therefore combines a CDN, cache, and read replica to serve reads cheaply, uses object storage for the photo files, and uses a queue with workers to keep uploads quick while thumbnails are created in the background.