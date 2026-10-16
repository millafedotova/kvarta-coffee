import type { Dictionary } from "../types";

export const en = {
  brand: "Kvarta",
  skipLink: "Skip to content",
  header: {
    workshop: "COFFEE ROASTING WORKSHOP",
    location: "MINSK",
    home: "Kvarta — back to top",
    navigationLabel: "Site sections",
    coffee: "Our coffee",
    subscription: "Subscription",
    roastery: "Roastery",
    delivery: "Delivery",
    request: "Send an inquiry",
  },
  language: {
    label: "Website language",
    pending: "Please wait for the submission result before changing language.",
    storageError:
      "We could not keep your form details while changing language. Stay here, or continue and fill in the form again.",
    stay: "Stay here",
    continue: "Continue without form details",
  },
  hero: {
    roast: ["Roasted", "on Thursday."],
    deliver: ["At your door", "on Friday."],
    description:
      "Coffee for home and the office. Your beans reach you 1–3 days after roasting.",
    choose: "Choose your coffee",
    subscribe: "Start a subscription",
    imageAlt: "A close-up of freshly roasted coffee beans",
  },
  catalog: {
    title: "Beans and drip bags",
    description:
      "Flowers and bergamot, caramel or chocolate — find the flavours you enjoy.",
    help: "Not sure where to start?",
    helpAction: "We can help you choose",
    grams: "{count} g",
    bags: "{count} bags",
  },
  coffee: {
    open: "Open description: {product}",
    moreAbout: "More about: {product}",
    more: "Details",
    choose: "I'd like this coffee",
    close: "Close",
    closeDetails: "Close coffee details",
    recipe: "Your first-cup recipe",
    recipeNote:
      "Change one variable at a time. This makes it easier to find the grind and ratio that taste right to you.",
    ordering: "Choose your set",
    profile: "About the beans",
  },
  products: {
    "ethiopia-yirgacheffe": {
      name: "Ethiopia Yirgacheffe",
      origin: "ETHIOPIA",
      notes: "Flowers, bergamot",
      detail: "Light roast",
      imageAlt: "A light-coloured Kvarta coffee bag — Ethiopia Yirgacheffe",
      details: {
        introduction:
          "Floral Ethiopian coffee with bergamot, lively citrus acidity and a light, tea-like body. We roast it light to preserve delicate aromatics and let the flavour unfold as the cup cools. Choose it for pour-over or a filter coffee maker when you want a clean, expressive black coffee.",
        recipe: {
          facts: [
            {
              label: "Method",
              value: "V60 / pour-over",
              description:
                "Rinse the filter with hot water and discard that water before brewing.",
            },
            {
              label: "Coffee / water",
              value: "15 g / 250 g · 1:16.7",
            },
            {
              label: "Temperature",
              value: "92–94 °C",
            },
            {
              label: "Time",
              value: "2:30–3:00, including the bloom",
            },
          ],
        },
        profile: [
          {
            label: "Region",
            value: "Yirgacheffe, Ethiopia",
            description: "An Ethiopian highland coffee district.",
          },
          {
            label: "Varieties",
            value: "Heirloom",
            description:
              "A collective name for traditional local Arabica cultivars.",
          },
          {
            label: "Processing",
            value: "Washed",
            description:
              "The fruit pulp is removed and the beans are washed before drying.",
          },
          {
            label: "Growing altitude",
            value: "1,800–2,200 m",
            description:
              "The cool highland climate slows cherry ripening, supporting aromatic complexity and expressive acidity.",
          },
        ],
      },
    },
    "colombia-huila": {
      name: "Colombia Huila",
      origin: "COLOMBIA",
      notes: "Caramel, red apple",
      imageAlt: "A light-coloured Kvarta coffee bag — Colombia Huila",
      details: {
        introduction:
          "Caramel sweetness and juicy red apple in a balanced cup. Refreshing acidity and a mellow finish make this an easy everyday choice. Brew it black to explore the fruit notes, or add milk to bring the caramel sweetness forward.",
        recipe: {
          facts: [
            {
              label: "Method",
              value: "V60 / pour-over",
              description:
                "Rinse the filter with hot water and discard that water before brewing.",
            },
            {
              label: "Coffee / water",
              value: "15 g / 250 g · 1:16.7",
            },
            {
              label: "Temperature",
              value: "92–94 °C",
            },
            {
              label: "Time",
              value: "2:30–3:00, including the bloom",
            },
          ],
        },
        profile: [
          {
            label: "Region",
            value: "Huila, Colombia",
            description: "A coffee-growing region in the Colombian Andes.",
          },
          {
            label: "Varieties",
            value: "Caturra, Castillo",
            description:
              "Caturra descends from Bourbon, while Castillo was developed by Colombian breeders for local growing conditions.",
          },
          {
            label: "Processing",
            value: "Washed",
            description:
              "The fruit pulp is removed, then the beans are washed and dried.",
          },
          {
            label: "Growing altitude",
            value: "1,500–1,900 m",
            description:
              "Coffee grows on Andean mountain plots, where a cool climate allows the cherries to ripen gradually.",
          },
        ],
      },
    },
    "brazil-cerrado": {
      name: "Brazil Cerrado",
      origin: "BRAZIL",
      notes: "Nuts, chocolate",
      detail: "For espresso",
      imageAlt: "A light-coloured Kvarta coffee bag — Brazil Cerrado",
      details: {
        introduction:
          "Rich coffee with nuts, chocolate and a full body. We roast it for espresso to bring out sweetness, gentle acidity and a lasting chocolate finish. Enjoy it on its own or in a cappuccino or latte, where its coffee flavour holds its own with milk.",
        recipe: {
          facts: [
            {
              label: "Method",
              value: "Espresso",
              description:
                "Distribute the grounds evenly in the basket and tamp.",
            },
            {
              label: "Dose / yield",
              value: "18 g / 36 g · 1:2",
            },
            {
              label: "Temperature",
              value: "93 °C",
            },
            {
              label: "Time",
              value: "25–35 seconds",
            },
          ],
        },
        profile: [
          {
            label: "Region",
            value: "Cerrado Mineiro, Brazil",
            description: "The coffee-growing plateaus of Minas Gerais.",
          },
          {
            label: "Varieties",
            value: "Catuaí, Mundo Novo",
            description:
              "Mundo Novo comes from Typica and Bourbon; Catuaí is a cross between Mundo Novo and Caturra.",
          },
          {
            label: "Processing",
            value: "Natural",
            description:
              "The cherries are dried whole before the beans are separated from the dried fruit.",
          },
          {
            label: "Growing altitude",
            value: "900–1,200 m",
            description:
              "The Cerrado plateaus have warm, wet summers followed by dry winters suited to drying coffee cherries.",
          },
        ],
      },
    },
    "drip-assortment": {
      name: "Drip bags",
      origin: "DRIP COFFEE BAGS",
      notes: "One coffee or an assortment",
      detail: "Brew straight into your cup",
      imageAlt: "A Kvarta coffee box and a single-serve drip bag",
      details: {
        introduction:
          "Ten portions of coffee in individual filter bags. Choose one favourite coffee for the whole set or a discovery assortment of different coffees to compare flavours and explore our roasting. Drip bags travel easily to work or on a trip: no coffee maker or grinder required.",
        ordering:
          "For a single-coffee set, write the coffee’s name in your inquiry comment. To explore the range, write “discovery assortment” and we will put different flavours in one set. We will agree your preferences and order details by phone.",
      },
    },
  },
  subscription: {
    eyebrow: "COFFEE SUBSCRIPTION",
    title: ["Two bags", "every month"],
    monthly: "BYN / month",
    quantity: "{count} bags × {weight} g",
    included: "Delivery across Minsk included",
    action: "I'd like a subscription",
    steps: [
      "Send an inquiry",
      "We agree the details by phone",
      "Receive your coffee every month",
    ],
    imageAlt: "A close-up of coffee crema",
  },
  roastery: {
    eyebrow: "THE ROASTERY",
    title: ["We're Anya", "and Dima"],
    introduction:
      "We used to work as baristas. Since 2019, we have been roasting coffee in our own workshop at 9 Korolya Street in Minsk.",
    batches:
      "We roast in small {batch} kg batches so your coffee arrives fresh and full of aroma.",
  },
  gallery: {
    label: "Our coffee roasting process",
    instructions: "Roastery photos. Use the left and right arrow keys",
    carousel: "carousel",
    slide: "slide",
    position: "{current} of {total}",
    previous: "Previous photo",
    next: "Next photo",
    photos: [
      {
        alt: "A roaster's hands holding a coffee sampling tool beside a small roaster",
        caption: "Checking the beans during roasting.",
      },
      {
        alt: "Green coffee beans being poured into a roaster's loading hopper",
        caption: "Loading green coffee beans into the roaster.",
      },
      {
        alt: "Roasted beans falling from the roaster into a cooling tray",
        caption: "Cooling the beans in the tray after roasting.",
      },
      {
        alt: "A roaster inspecting coffee beans in a metal tray",
        caption: "Checking the beans after roasting.",
      },
    ],
  },
  delivery: {
    title: ["Delivery", "and pickup"],
    delivery: "DELIVERY",
    schedule: ["Across Minsk.", "Every Friday."],
    free: "Free on orders from {price}",
    details:
      "Our manager will confirm the delivery fee for orders below {price}. We'll agree the delivery time by phone.",
    pickup: "PICK UP AT THE ROASTERY",
    street: "9 Korolya St.",
    city: "Minsk.",
    address: "9 Korolya Street, Minsk",
    hours: "Opening hours",
    weekdays: "Mon–Fri",
    weekends: "Sat–Sun",
  },
  form: {
    title: ["Order coffee", "or ask a question"],
    description:
      "Leave your number. We'll call to help you choose coffee and arrange delivery.",
    advice: [
      "Not sure which coffee to choose?",
      "Tell us how you usually brew it.",
    ],
    name: "Your name",
    namePlaceholder: "What should we call you?",
    phone: "Phone",
    interest: "What are you interested in?",
    interests: {
      subscription: "Subscription",
      one_time: "One-time order",
      question: "I have a question",
    },
    product: "Which coffee?",
    multiple: "choose one or more",
    quantity: "Quantity: {product}",
    decrease: "Decrease quantity: {product}",
    increase: "Increase quantity: {product}",
    packs: "× {count}",
    quantityHint: "Up to {max} packs of each coffee.",
    clear: "Clear selection",
    subscription: "YOUR SUBSCRIPTION",
    subscriptionQuantity: "{count} bags of {weight} g every month",
    subscriptionPrice: "{price} · delivery included",
    comment: "Comment",
    optional: "optional",
    commentPlaceholder: "What coffee do you enjoy? Any preferences?",
    submit: "Send an inquiry",
    retry: "Try again",
    submitting: "Sending…",
    pending: "Sending your inquiry…",
    hint: "We'll confirm your order by phone. No payment is needed on the website.",
    noScript: "Enable JavaScript in your browser to send an inquiry.",
    success: "Inquiry received. We'll call to agree the details of your order.",
    duplicate:
      "We already have your inquiry. There's no need to send it again — we'll be in touch.",
  },
  errors: {
    nameRequired: "What should we call you?",
    nameTooLong: "Enter a name of no more than 100 characters.",
    nameInvalid: "Re-enter your name: it contains an invalid character.",
    phoneRequired: "Enter your phone number.",
    phoneTooLong: "Check your phone number.",
    phoneInvalid:
      "Enter +375 followed by 9 digits. For example: +375 29 123-45-67.",
    interestRequired: "Choose what you're interested in.",
    commentTooLong: "Keep your comment within 1,000 characters.",
    commentInvalid: "Re-enter your comment or leave it blank.",
    productSelectionInvalid: "Choose coffee for a one-time order.",
    duplicateProducts: "Remove duplicate items.",
    productsInvalid: "Select your coffee again.",
    quantitiesInvalid: "Check the quantities of your selected coffees.",
    fieldInvalid: "Check the value in this field.",
  },
  feedback: {
    invalidFields: "Check the highlighted fields and try again.",
    invalidRequest:
      "We couldn't send your inquiry. Refresh the page and try again.",
    tooLarge: "Shorten your comment and try again.",
    unavailable:
      "We couldn't send your inquiry. Try again later. Your details are still in the form.",
    networkError:
      "We couldn't confirm your inquiry was sent. Check your connection and try again. Your details are still in the form.",
  },
  footer: {
    description: "Whole-bean coffee and drip bags.",
    back: "Back to top",
    copyright: "© Kvarta, {year}",
  },
  metadata: {
    title: "Kvarta — freshly roasted coffee in Minsk",
    description:
      "Roasted on Thursday, delivered on Friday. Small {batch} kg batches, drip coffee bags, and a subscription: {count} bags of {weight} g for {price} per month.",
    socialDescription:
      "A small coffee roastery in Minsk. Roasted on Thursday. At your door on Friday.",
    previewRoast: "Roasted on Thursday.",
    previewDeliver: "At your door on Friday.",
    previewBatch: "SMALL {batch} KG BATCHES",
    previewProducts: "BEANS · DRIP BAGS · SUBSCRIPTIONS",
    manifest: "Kvarta — freshly roasted coffee",
  },
  recovery: {
    notFound: "Page not found",
    notFoundDescription: "Check the address or return to the homepage.",
    home: "Go to homepage",
    error: "We couldn't open this page",
    errorDescription:
      "Please try again. If the problem continues, refresh the page.",
    retry: "Try again",
  },
} satisfies Dictionary;
