// Import utilities from `astro:content`
import { z, defineCollection } from 'astro:content'
// Define a `type` and `schema` for each collection

const introductionCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    section: z.number(),
    tags: z.array(z.string()),
    showRightSideBar: z.boolean().optional()
  })
})

const featuresCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    section: z.number(),
    tags: z.array(z.string()),
    showRightSideBar: z.boolean().optional()
  })
})

const componentsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    mainComponent: z.boolean().optional()
  })
})

const typesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string())
  })
})

const hooksCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string())
  })
})

const functionsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string())
  })
})

const layoutsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    section: z.number(),
    tags: z.array(z.string()),
    showRightSideBar: z.boolean().optional()
  })
})

// Export a single `collections` object to register your collection(s)
export const collections = {
  introduction: introductionCollection,
  features: featuresCollection,
  components: componentsCollection,
  types: typesCollection,
  hooks: hooksCollection,
  functions: functionsCollection,
  layouts: layoutsCollection
}
