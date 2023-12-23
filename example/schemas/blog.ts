import { Node, Relationship, Types } from "neo4j-querier";
import {
  date,
  date_optional,
  id, int_list, json,
  property, property_list,
  relation_many,
  relation_one,
  relation_optional,
  string,
  string_list,
  string_optional
} from "neo4j-querier/fields";
import { list, PropertyValue } from "@cypher/types";
import { matchesRegex } from "cypher/expression";
import { Neo4jParamValue } from "@core/neo4j-value";
import { isSlug } from "../utils";

//@formatter:off

// export class NumberGreaterThanZero extends PropertyType<number, number>({
//   parseValue: (val: Neo4jParamValue) => {},
//   serialize: (val) => {}
// }) {}


// interface ContentBlockType {}
//
// export class ContentBlock extends JsonPropertyType<ContentBlockType>({
//   validate: (object: any) => {
//     return "metadata" in object;
//   }
// }) {}

export class PUBLISHED_VERSION extends Relationship("PUBLISHED_VERSION") {}
export class USES_IMAGE_FOR_CONTENT extends Relationship("USES_IMAGE_FOR_CONTENT") {}
export class USES_IMAGE_FOR_PREVIEW extends Relationship("USES_IMAGE_FOR_PREVIEW") {}
export class HAS_TODO extends Relationship("HAS_TODO") {}
export class IMAGE_OF extends Relationship("IMAGE_OF") {}
export class HAS_COMMENT extends Relationship("HAS_COMMENT") {}

const post_content = () => property_list(Types.String);

export class BlogPost extends Node("BlogPost") {
  createdAt = date({ generate: new Date()} );
  shortId   = id({ readonly: true });

  title     = string_optional();
  date      = date_optional();
  slug      = string_optional({ validate: isSlug });
  content   = post_content();
  preview   = string_list();

  published_version = relation_optional(PUBLISHED_VERSION, "->", PublishedBlogPost, "no-delete");
  todos             = relation_many(HAS_TODO, "->", BlogPostTodo);
  comments          = relation_many(HAS_COMMENT, "->", Comment);
  previewImage      = relation_optional(USES_IMAGE_FOR_PREVIEW, "->", Image);
  contentImages     = relation_many(USES_IMAGE_FOR_CONTENT, "->", Image);
}

export class PublishedBlogPost extends Node("PublishedBlogPost") {
  title   = string();
  date    = date();
  slug    = string({ validate: val => matchesRegex(val, /^[a-z]+(-[a-z]+)*$/) });
  content = post_content();
  preview = string_list();

  parent        = relation_one(PUBLISHED_VERSION, "<-", BlogPost);
  previewImage  = relation_one(USES_IMAGE_FOR_PREVIEW, "->", Image);
  contentImages = relation_many(USES_IMAGE_FOR_CONTENT, "->", Image);
}

export class BlogPostTodo extends Node("BlogPostTodo") {
  title   = string();
  content = string_list();

  on = relation_one(HAS_TODO, "<-", BlogPost);
}

export class Image extends Node("Image") {
  resourceId = id();
  altText    = string();
  metadata   = json();

  usedInBlogPostContent           = relation_many(USES_IMAGE_FOR_CONTENT, "<-", BlogPost);
  usedInPublishedBlogPostContent  = relation_many(USES_IMAGE_FOR_CONTENT, "<-", PublishedBlogPost);
  usedAsBlogPostPreview           = relation_many(USES_IMAGE_FOR_PREVIEW, "<-", BlogPost);
  usedAsPublishedBlogPostPreview  = relation_many(USES_IMAGE_FOR_PREVIEW, "<-", PublishedBlogPost);
}

export class Comment extends Node("Comment") {
  name    = string();
  email   = string_optional();
  message = string();

  onPost = relation_one(HAS_COMMENT, "<-", BlogPost);
}