import {
  BlogPost,
  Image,
  IMAGE_OF,
  PublishedBlogPost,
  USES_IMAGE_FOR_CONTENT,
} from "./schemas/blog";
import { relateTo } from "@cypher/mutation/operations/relate-to";
import { equals } from "@cypher/expression";
import { createNode, findAllByIDs, findByID, map, project } from "@cypher/queries";
import { query } from "@cypher/query";
import {
  $createNode,
  $deleteNode,
  $forceCardinality,
  $matchNode,
  $throwIfNull,
  $updateNode,
  $where,
} from "@cypher/stages";
import * as util from "util";
import { nanoid } from "nanoid";
import { executor } from "./executor";
import { Species } from "./schemas/taxonomy";
import { $unionSubquery } from "@cypher/stages/$unionSubquery";
import { stringLiteral } from "@cypher/expression/literal";

const getPostByShortID = (shortId: string) =>
  query()
    .pipe(() => $matchNode("@", BlogPost))
    .pipe(bp => $where(equals(bp.shortId, shortId)))
    .pipe(bp => ({
      id: bp.id,
      previewImage: project(bp.previewImage, img => ({ resourceId: img.resourceId })),
    }));

const createBlogPost = () =>
  query()
    .pipe(() =>
      $createNode("@", BlogPost, {
        shortId: nanoid(5),
      }),
    )
    .pipe(bp => bp.id);

const updateBlogPost = (
  id: string,
  data: {
    title?: string;
    date?: Date;
    previewImageID?: string;
    contentImageIDs?: string[];
  },
) =>
  query()
    .pipe(() => findByID(BlogPost, id))
    .pipe(bp =>
      $updateNode(bp, {
        title: data.title,
        date: data.date,
        previewImage: relateTo(findByID(Image, data.previewImageID, { optional: true })),
        // contentImages: relateTo(findAllByIDs(Image, data.contentImageIDs ?? [])),
      }),
    );

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
  query()
    .pipe(() => updateBlogPost(id, data))
    .pipe(bp =>
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
    )
    .pipe(bp => bp.id);

async function run() {
  const result = await query()
    .pipe(() => $matchNode("@", BlogPost))
    .pipe(node => $deleteNode(node))
    .run(executor);

  console.log(util.inspect(result, false, null, true));
}

run();

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
//   todoIDs: project(bp.todos, todo => todo.id),
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
