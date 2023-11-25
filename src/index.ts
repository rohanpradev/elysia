import { Elysia, t } from 'elysia';
import { PrismaClient } from '@prisma/client';
import { swagger } from '@elysiajs/swagger';

const setup = (app: Elysia) => app.decorate('db', new PrismaClient());

const app = new Elysia()
  // 🎬 Movie API routes 🎬
  .use(
    swagger({
      path: '/v1/swagger',
    })
  )
  .use(setup)
  .group('/search', (app) => {
    return app
      .get('/', async ({ query, db }) => db.movie.findMany())
      .guard(
        {
          query: t.Object({
            q: t.String(),
          }),
        },
        (app) =>
          app
            .get('/movie', async ({ query, db }) => {
              return db.movie.findMany({
                where: {
                  title: {
                    contains: query.q,
                    mode: 'insensitive',
                  },
                },
              });
            })
            .get('/tv', async ({ query, db }) => {
              return db.movie.findMany({
                where: {
                  title: {
                    contains: query.q,

                    mode: 'insensitive',
                  },
                  type: 'series',
                },
              });
            })
            .get('/person', async ({ query, db }) => {
              return db.person.findMany({
                where: {
                  name: {
                    contains: query.q,
                    mode: 'insensitive',
                  },
                },
              });
            })
            // .get("/company", ({ query }) => `query: ${query.q}`)
            .get('/episode', async ({ query, db }) => {
              return db.episode.findMany({
                where: {
                  title: {
                    contains: query.q,
                    mode: 'insensitive',
                  },
                },
              });
            })
            .get('/review', async ({ query, db }) => {
              return db.review.findMany({
                where: {
                  comment: {
                    contains: query.q,
                    mode: 'insensitive',
                  },
                },
              });
            })
            .get('/award', async ({ query, db }) => {
              return db.award.findMany({
                where: {
                  name: {
                    contains: query.q,
                    mode: 'insensitive',
                  },
                },
              });
            })
      );
  })
  .group('/title/:id', (app) => {
    return app
      .guard({
        params: t.Object({
          id: t.Numeric(),
        }),
      })
      .get('/', async ({ params: { id }, db }) => {
        return db.movie.findUnique({
          where: {
            id,
          },
        });
      })
      .get('/episodes', async ({ params: { id }, db }) => {
        return db.movie.findMany({
          where: {
            episodes: {
              some: {
                movieId: id,
              },
            },
          },
        });
      })
      .get('/cast', async ({ params: { id }, db }) => {
        return db.person.findMany({
          where: {
            movies: {
              some: {
                id,
              },
            },
          },
        });
      })
      .get('/reviews', async ({ params, db }) => {
        return db.review.findMany({
          where: {
            movieId: params.id,
          },
        });
      })
      .get('/awards', async ({ params: { id }, db }) => {
        return db.award.findMany({
          where: {
            movieId: id,
          },
        });
      });
  })

  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
