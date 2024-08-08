import { Types } from "neo4j-querier";
import {
  date,
  date_optional, dateTime_optional,
  id,
  json,
  property_list,
  relation_many,
  relation_one,
  relation_optional,
  string,
  string_list,
  string_optional
} from "neo4j-querier/Fields";
import { isSlug } from "../utils";
import { matchesRegex } from "@cypher/expression/function/string";
import { node, relationship } from "@schema/entity-config";
import { BaseNode } from "../BaseNode";
import { $ } from "@schema/inherit-mixin";

//@formatter:off


export class PUBLISHED_AS {
  $ = relationship({name: "PUBLISHED_AS"})
}

export class USES_IMAGE_FOR_CONTENT {
  $ = relationship({name: "USES_IMAGE_FOR_CONTENT"})
}

export class USES_IMAGE_FOR_PREVIEW {
  $ = relationship({name: "USES_IMAGE_FOR_PREVIEW"})
}

export class HAS_TODO {
  $ = relationship({name: "HAS_TODO"})
}

export class IMAGE_OF {
  $ = relationship({name: "IMAGE_OF"})
}

export class HAS_COMMENT {
  $ = relationship({name: "HAS_COMMENT"})
}

const post_content = () => property_list(Types.String);

export class BlogPost extends $(BaseNode) {
  $ = node({ label: "BlogPost" })

  createdAt = date({ generate: new Date()} );
  shortId   = id({ readonly: true });

  title       = string_optional();
  displayDate = dateTime_optional();
  slug        = string_optional({ validate: isSlug });
  content     = post_content();
  preview     = string_list();

  published_version = relation_optional(PUBLISHED_AS, "->", PublishedBlogPost, "no-delete");
  todos             = relation_many(HAS_TODO, "->", BlogPostTodo);
  comments          = relation_many(HAS_COMMENT, "->", Comment);
  previewImage      = relation_optional(USES_IMAGE_FOR_PREVIEW, "->", Image);
  contentImages     = relation_many(USES_IMAGE_FOR_CONTENT, "->", Image);
}

export class PublishedBlogPost extends $(BaseNode) {
  $ = node({ label: "PublishedBlogPost" })

  title   = string();
  date    = date();
  slug    = string({ validate: val => matchesRegex(val, /^[a-z]+(-[a-z]+)*$/) });
  content = post_content();
  preview = string_list();

  parent        = relation_one(PUBLISHED_AS, "<-", BlogPost);
  previewImage  = relation_one(USES_IMAGE_FOR_PREVIEW, "->", Image);
  contentImages = relation_many(USES_IMAGE_FOR_CONTENT, "->", Image);
}

export class BlogPostTodo extends $(BaseNode) {
  $ = node( {label: "BlogPostTodo"} )

  title   = string();
  content = string_list();

  on = relation_one(HAS_TODO, "<-", BlogPost);
}

export class Image extends $(BaseNode) {
  $ = node( {label: "Image"} )

  publicId = id();
  altText    = string();
  metadata   = json();

  usedInBlogPostContent           = relation_many(USES_IMAGE_FOR_CONTENT, "<-", BlogPost);
  usedInPublishedBlogPostContent  = relation_many(USES_IMAGE_FOR_CONTENT, "<-", PublishedBlogPost);
  usedAsBlogPostPreview           = relation_many(USES_IMAGE_FOR_PREVIEW, "<-", BlogPost);
  usedAsPublishedBlogPostPreview  = relation_many(USES_IMAGE_FOR_PREVIEW, "<-", PublishedBlogPost);
}

export class Comment extends $(BaseNode) {
  $ = node( {label: "Comment"} )

  name    = string();
  email   = string_optional();
  message = string();

  onPost = relation_one(HAS_COMMENT, "<-", BlogPost);
}