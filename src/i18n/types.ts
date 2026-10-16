import type { ProductId } from "@/content/coffee";
import type { CoffeeDetails } from "@/content/coffee-details";
import type { LeadErrorCode, FeedbackCode } from "@/lib/lead-errors";

type Template<K extends string> = `${string}{${K}}${string}`;
type Pair = readonly [string, string];

export interface ProductCopy {
  name: string;
  origin: string;
  notes: string;
  detail?: string;
  imageAlt: string;
  details: CoffeeDetails;
}

export interface Dictionary {
  brand: string;
  skipLink: string;
  header: {
    workshop: string;
    location: string;
    home: string;
    navigationLabel: string;
    coffee: string;
    subscription: string;
    roastery: string;
    delivery: string;
    request: string;
  };
  language: {
    label: string;
    pending: string;
    storageError: string;
    stay: string;
    continue: string;
  };
  hero: {
    roast: Pair;
    deliver: Pair;
    description: string;
    choose: string;
    subscribe: string;
    imageAlt: string;
  };
  catalog: {
    title: string;
    description: string;
    help: string;
    helpAction: string;
    grams: Template<"count">;
    bags: Template<"count">;
  };
  coffee: {
    open: Template<"product">;
    moreAbout: Template<"product">;
    more: string;
    choose: string;
    close: string;
    closeDetails: string;
    profile: string;
    recipe: string;
    recipeNote: string;
    ordering: string;
  };
  products: Record<ProductId, ProductCopy>;
  subscription: {
    eyebrow: string;
    title: Pair;
    monthly: string;
    quantity: Template<"count"> & Template<"weight">;
    included: string;
    action: string;
    steps: readonly [string, string, string];
    imageAlt: string;
  };
  roastery: {
    eyebrow: string;
    title: Pair;
    introduction: string;
    batches: Template<"batch">;
  };
  gallery: {
    label: string;
    instructions: string;
    carousel: string;
    slide: string;
    position: Template<"current"> & Template<"total">;
    previous: string;
    next: string;
    photos: readonly { alt: string; caption: string }[];
  };
  delivery: {
    title: Pair;
    delivery: string;
    schedule: Pair;
    free: Template<"price">;
    details: Template<"price">;
    pickup: string;
    street: string;
    city: string;
    address: string;
    hours: string;
    weekdays: string;
    weekends: string;
  };
  form: {
    title: Pair;
    description: string;
    advice: Pair;
    name: string;
    namePlaceholder: string;
    phone: string;
    interest: string;
    interests: { subscription: string; one_time: string; question: string };
    product: string;
    multiple: string;
    quantity: Template<"product">;
    decrease: Template<"product">;
    increase: Template<"product">;
    packs: Template<"count">;
    quantityHint: Template<"max">;
    clear: string;
    subscription: string;
    subscriptionQuantity: Template<"count"> & Template<"weight">;
    subscriptionPrice: Template<"price">;
    comment: string;
    optional: string;
    commentPlaceholder: string;
    submit: string;
    retry: string;
    submitting: string;
    pending: string;
    hint: string;
    noScript: string;
    success: string;
    duplicate: string;
  };
  errors: Record<LeadErrorCode, string>;
  feedback: Record<FeedbackCode, string>;
  footer: {
    description: string;
    back: string;
    copyright: Template<"year">;
  };
  metadata: {
    title: string;
    description: Template<"batch"> &
      Template<"count"> &
      Template<"weight"> &
      Template<"price">;
    socialDescription: string;
    previewRoast: string;
    previewDeliver: string;
    previewBatch: Template<"batch">;
    previewProducts: string;
    manifest: string;
  };
  recovery: {
    notFound: string;
    notFoundDescription: string;
    home: string;
    error: string;
    errorDescription: string;
    retry: string;
  };
}
