import { $throwIf, $optionalMatchNode, $updateNode, $where } from "neo4j-querier/Stages";
import { BlogPost, Image, PublishedBlogPost } from "./schemas/blog";
import { createNode, findAll, findAllByIDs, findByID, project } from "neo4j-querier/Queries";
import { equals, isNotNull, isNull } from "@cypher/expression/operators";
import { query } from "@core/query";
import { runQuery } from "./runQuery";
import { relateTo } from "@cypher/mutation/operations/relate-to";
import { nanoid } from "nanoid";
import { forceType } from "@cypher/expression/casting";
import { Optional } from "@cypher/types/optional";
import { propUnsafe } from "@cypher/expression/prop";

// const getPostByShortID = (shortId: string) =>
//   query(
//     findAll(BlogPost),
//     bp => $where(equals(bp.shortId, shortId)),
//     bp => ({
//       id: bp.id,
//       title: bp.title,
//       previewImage: project(bp.previewImage, img => ({ publicId: img.publicId })),
//     }),
//   );

function createBlogPost(data: { title: string }) {
  return query(
    createNode(BlogPost, {
      title: data.title,
      shortId: nanoid(5),
    }),
    bp => bp.id,
  );
}

function createDummyImage() {
  return createNode(Image, {
    publicId: "dummy-id",
    altText: "A Dummy Image",
    metadata: {},
  });
}

function updateBlogPost(
  id: string,
  data: {
    title?: string;
    date?: Date;
    previewImageID?: string;
    contentImageIDs?: string[];
  },
) {
  return query(findByID(BlogPost, id), bp =>
    $updateNode(bp, {
      title: data.title,
      displayDate: data.date,
      previewImage: relateTo(findByID(Image, data.previewImageID, { optional: true })),
      contentImages: relateTo(findAllByIDs(Image, data.contentImageIDs ?? [])),
    }),
  );
}

const publishBlogPost = (
  id: string,
  data: {
    title: string;
    date: Date;
    previewImageID: string;
    slug: string;
    contentImageIDs: string[];
    content: string[];
    previewContent: string[];
  },
) =>
  query(
    () => updateBlogPost(id, data),
    bp =>
      $updateNode(bp, {
        published_version: relateTo(
          createNode(PublishedBlogPost, {
            title: data.title,
            content: data.content,
            date: data.date,
            slug: data.slug,
            previewImage: relateTo(findByID(Image, data.previewImageID)),
            contentImages: relateTo(findAllByIDs(Image, data.contentImageIDs ?? [])),
            parent: "auto",
            preview: data.previewContent,
          }),
        ),
      }),
    bp => bp.id,
  );

// DUMMY IMAGE: 1066ad46-2c70-4985-9413-24e960ce5f43
// DUMMY BLOG POST: fc9cb011-5505-45bd-ade2-9e7f5cb26899

runQuery(
  publishBlogPost("fc9cb011-5505-45bd-ade2-9e7f5cb26899", {
    title: "ANOTHER NEW POST TITLE",
    content: [],
    contentImageIDs: [],
    date: new Date(),
    previewContent: [],
    slug: "some-slug",
    previewImageID: "1066ad46-2c70-4985-9413-24e960ce5f43",
  }),
).then(console.log);

/*
export declare const mapBySubtype: <
  TNode extends NodeLikeOrUnionDefinition,
  TData extends "$subtypes" extends keyof TNode
    ? {
        [K in keyof TNode["$subtypes"]]?: (
          // @ts-expect-error
          node: GraphNode<Deconstruct<TNode["$subtypes"][K]>>,
          // @ts-expect-error
          kind: "$name" extends keyof Deconstruct<TNode["$subtypes"][K]>
            ? // @ts-expect-error
              StringLiteral<Deconstruct<TNode["$subtypes"][K]>["$name"]>
            : unknown,
        ) => Mapping<"1->1"> | Mapping<"1->?">;
      }
    : {},
>(
  node: MakeNodeValue<TNode>,
  input: TData,
) => Query<
  Union<
    {
      // @ts-expect-error
      [K in keyof TData]: ParseMapping<ReturnType<TData[K]>>;
    }[keyof TData]
  >,
  "none-or-one"
>;

 */

// const q = startQuery()
//   .pipe(() =>
//     $match(
//       startPath().nodePattern(Taxon, ":taxon").relationshipPattern(MEMBER_OF, "->", ":rel"),
//     ),
//   )
//   .pipe(({ taxon, rel }) =>
//     mapBySubtype(taxon, {
//       Species: (sp, kind) => [sp.id, kind],
//       TaxonomicGrouping: tg =>
//         mapBySubtype(tg, {
//           Family: (fam, kind) => [fam.id, kind],
//           Order: (ord, kind) => [ord.id, kind],
//         }),
//     }),
//   );

// .pipe(bp => ({
//   ...pick(bp, "title", "id"),
//   todoIDs: project(bp.todos, _todo => _todo.id),
// }));

// async function run() {
//   const result = await q.run(executor);
//   console.log(util.inspect(result, false, null, true));
// }
//
// run();

// const recentlyPublishedBlogPosts = (limit: number, skip: number = 0) =>
//   startQuery()
//     .pipe(() => findAll(PublishedBlogPost))
//     .pipe(bp => $orderBy([bp.date, "ASC"]))
//     .pipe(bp => ({
//       ...pick(bp, "id", "date", "title", "preview"),
//       previewImage: map(match(bp.previewImage), img => img.id),
//     }))
//     .pipe(() => $paginate({ limit, skip }));
//
//
// const getImageUsedIn = (id: string) =>
//   startQuery()
//     .pipe(() => findByID(Image, id))
//     .pipe(image =>
//       union(
//         project(image.usedAsBlogPostPreview, bp => ({
//           use: stringLiteral("blog_post_preview"),
//           id: bp.id,
//           title: bp.title,
//         })),
//         project(image.usedInPublishedBlogPostContent, bp => ({
//           use: stringLiteral("blog_post_content"),
//           id: bp.id,
//           title: bp.title,
//         })),
//         project(image.usedAsPublishedBlogPostPreview, bp => ({
//           use: stringLiteral("published_blog_post_preview"),
//           id: bp.id,
//           title: bp.title,
//         })),
//         project(image.usedInPublishedBlogPostContent, bp => ({
//           use: stringLiteral("published_blog_post_content"),
//           id: bp.id,
//           title: bp.title,
//         })),
//       ),
//     );
//
// export const getPublishedBlogPosts = () =>
//   map(findAll(PublishedBlogPost), bp => ({
//     ...pick(bp, "id", "date", "title", "slug", "content", "preview"),
//     previewImage: project(bp.previewImage, img => pick(img, "id", "resourceId", "altText")),
//     contentImages: project(bp.contentImages, img => pick(img, "id", "resourceId", "altText")),
//   }));
//
// async function run() {
//   const result = await publishBlogPost("aaa", {
//     date: new Date(),
//     previewImageID: "aa",
//     contentImageIDs: [],
//     previewContent: [],
//     slug: "",
//     content: [],
//     title: "",
//   }).run(executor);
//
//   console.log(util.inspect(result, false, null, true));
// }

// run();
