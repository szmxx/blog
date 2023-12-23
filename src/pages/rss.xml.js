import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";

export async function GET(context) {
  const posts = await getCollection("blog");
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    xmlns: {
      media: "http://search.yahoo.com/mrss/",
      atom: "http://www.w3.org/2005/Atom",
    },
    // add atom:link to be compatible with atom
    customData: `<atom:link href="${context.site}rss.xml" rel="self" type="application/rss+xml" />`,
    items: posts.map((post) => ({
      ...post.data,
      link: `/blog/${post.slug}/`,
      customData: `<media:content
          type="image/${post.data.heroImage.format == "jpg" ? "jpeg" : "png"}"
          width="${post.data.heroImage.width}"
          height="${post.data.heroImage.height}"
          medium="image"
          url="${context.site + post.data.heroImage.src}" />
      `,
    })),
  });
}
