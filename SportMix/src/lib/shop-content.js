export const deliveryOptions = [
  { value: "courier", label: "Курьер 1-2 дня", fee: 390, description: "Доставка до двери по городу и области." },
  { value: "pickup", label: "Самовывоз", fee: 0, description: "Заберите заказ в удобное время." },
  { value: "express", label: "Экспресс сегодня", fee: 790, description: "Для срочных заказов в пределах города." },
];

export const paymentOptions = [
  { value: "card", label: "Карта онлайн", description: "Быстрый платёж картой прямо при оформлении." },
  { value: "cash", label: "Наличными при получении", description: "Подходит для курьерской доставки." },
  { value: "sbp", label: "СБП", description: "Оплата по QR-коду или через банковское приложение." },
];

export const promoCatalog = [
  {
    code: "SPORTMIX10",
    title: "Скидка 10% на заказ",
    description: "Хороший промокод для первой уверенной покупки.",
    type: "percent",
    value: 10,
    minSubtotal: 3000,
    accent: "Акция",
  },
  {
    code: "FREESHIP",
    title: "Бесплатная доставка",
    description: "Снимает стоимость доставки с заказа от 2500.",
    type: "free_shipping",
    value: 0,
    minSubtotal: 2500,
    accent: "Доставка",
  },
  {
    code: "RUN500",
    title: "Минус 500 на обувь",
    description: "Лучше всего подходит для кроссовок и беговых моделей.",
    type: "fixed",
    value: 500,
    minSubtotal: 5000,
    accent: "Обувь",
  },
];

export const homeCampaigns = [
  {
    title: "Весенний дроп",
    subtitle: "Новые модели для бега, зала и городского ритма.",
    category: "New",
    cta: "Смотреть новинки",
  },
  {
    title: "Сезон скидок",
    subtitle: "Подборка выгодных цен на обувь и одежду.",
    category: "Sale",
    cta: "Открыть скидки",
  },
  {
    title: "Собери комплект",
    subtitle: "Обувь, худи и аксессуары в одном стиле.",
    category: "Clothes",
    cta: "Собрать образ",
  },
];

export const homeTrustPoints = [
  "Отдельный checkout с итогом до подтверждения",
  "Сервисные страницы для доставки, оплаты и возврата",
  "Размеры, наличие и подбор товара без лишнего шума",
];

export const servicePages = {
  delivery: {
    title: "Доставка и оплата",
    eyebrow: "Сервис",
    description: "Показываем покупателю сроки, способы получения и понятные сценарии оплаты без лишней неопределенности.",
    highlights: [
      "Курьерская доставка за 1-2 дня по городу",
      "Самовывоз без комиссии",
      "Экспресс-доставка для срочных заказов",
    ],
    sections: [
      {
        title: "Как проходит оформление",
        body: "После подтверждения заказа мы проверяем наличие, резервируем нужный размер и отправляем статус в личный кабинет. Если нужна замена размера или уточнение адреса, менеджер связывается до отправки.",
      },
      {
        title: "Способы оплаты",
        body: "В магазине доступны оплата картой онлайн, наличными при получении и через СБП. На странице оформления покупатель сразу видит итоговую стоимость вместе с доставкой.",
      },
      {
        title: "Сроки",
        body: "Обычная курьерская доставка занимает 1-2 дня, самовывоз доступен после подтверждения, а экспресс-сценарий подходит для заказов день в день в пределах города.",
      },
    ],
  },
  payment: {
    title: "Оплата",
    eyebrow: "Сервис",
    description: "Страница помогает снять тревожность перед покупкой: чем платить, когда списываются деньги и что делать, если заказ нужно скорректировать.",
    highlights: [
      "Карта, наличные и СБП",
      "Итоговая сумма видна до подтверждения",
      "Поддержка по спорным платежам",
    ],
    sections: [
      {
        title: "Когда списываются деньги",
        body: "При оплате картой или через СБП платеж проходит в момент подтверждения заказа. Для оплаты при получении сумма фиксируется в заказе заранее, чтобы покупатель видел итог без сюрпризов.",
      },
      {
        title: "Что входит в стоимость",
        body: "Итог состоит из стоимости товаров и выбранного способа доставки. Если действует акция или промокод, скидка должна быть видна отдельной строкой в блоке summary.",
      },
      {
        title: "Если нужно изменить заказ",
        body: "До отправки заказа можно связаться с менеджером и изменить адрес, способ доставки или размер, если позиция еще доступна на складе.",
      },
    ],
  },
  returns: {
    title: "Возврат и обмен",
    eyebrow: "Сервис",
    description: "Для магазина важно не только продать, но и объяснить, что делать, если размер не подошел или товар нужно обменять.",
    highlights: [
      "Обмен размера через менеджера",
      "Понятный сценарий возврата",
      "Статус обращения можно уточнить по заказу",
    ],
    sections: [
      {
        title: "Если товар не подошел",
        body: "Покупатель указывает номер заказа, причину обращения и желаемый результат: обмен или возврат. Это помогает обработать заявку без длинной переписки.",
      },
      {
        title: "Что подготовить",
        body: "Лучше сразу приложить фото товара, сообщить размер, дату получения и контакт для связи. Чем полнее обращение, тем быстрее магазин подтверждает дальнейшие шаги.",
      },
      {
        title: "Как повысить доверие",
        body: "Отдельная сервисная страница с правилами обмена и возврата делает магазин визуально и функционально ближе к реальному e-commerce, а не к демо-витрине.",
      },
    ],
  },
  contacts: {
    title: "Контакты",
    eyebrow: "Поддержка",
    description: "Покупателю нужны быстрые способы связаться с магазином до и после покупки: телефон, почта, соцсети и понятный режим ответа.",
    highlights: [
      "Телефон: +7 (999) 888-77-66",
      "Email: manager@sportmix.store",
      "Поддержка по заказам и наличию",
    ],
    sections: [
      {
        title: "Когда писать",
        body: "Через контакты удобно уточнять наличие размеров, статус заказа, варианты доставки, обмен и рекомендации по подбору модели.",
      },
      {
        title: "Как отвечаем",
        body: "Лучший сценарий для магазина: дать покупателю ожидание по сроку ответа, чтобы он понимал, когда вернуться за результатом и не терял доверие.",
      },
      {
        title: "Что еще можно улучшить",
        body: "Следующим шагом сюда можно добавить адрес шоурума, карту, часы работы и отдельные каналы для корпоративных заказов или оптовых клиентов.",
      },
    ],
  },
};

const sizeGuideMap = {
  shoes: {
    title: "Таблица размеров обуви",
    columns: ["EU", "RU", "Стопа, см"],
    rows: [
      ["38", "37", "24.0"],
      ["39", "38", "24.7"],
      ["40", "39", "25.3"],
      ["41", "40", "26.0"],
      ["42", "41", "26.7"],
      ["43", "42", "27.3"],
      ["44", "43", "28.0"],
    ],
    note: "Если сомневаетесь между двумя размерами, для спортивной обуви лучше брать вариант с небольшим запасом.",
  },
  clothes: {
    title: "Таблица размеров одежды",
    columns: ["Размер", "Грудь, см", "Талия, см"],
    rows: [
      ["XS", "84-88", "70-74"],
      ["S", "88-92", "74-78"],
      ["M", "92-100", "78-86"],
      ["L", "100-108", "86-94"],
      ["XL", "108-116", "94-102"],
    ],
    note: "Для худи и оверсайз-моделей посадка может быть свободнее стандартной.",
  },
  bags: {
    title: "Параметры сумок и рюкзаков",
    columns: ["Размер", "Ширина", "Высота"],
    rows: [
      ["Compact", "24 см", "36 см"],
      ["Daily", "30 см", "44 см"],
      ["Training", "48 см", "28 см"],
    ],
    note: "Для тренировочных сумок ориентируйтесь на объём формы, обуви и аксессуаров.",
  },
};

export function getDeliveryOption(value) {
  return deliveryOptions.find((option) => option.value === value) || deliveryOptions[0];
}

export function getPaymentOption(value) {
  return paymentOptions.find((option) => option.value === value) || paymentOptions[0];
}

export function applyPromoCode({ code = "", subtotal = 0, deliveryFee = 0 } = {}) {
  const normalizedCode = String(code || "").trim().toUpperCase();

  if (!normalizedCode) {
    return {
      valid: false,
      code: "",
      discountAmount: 0,
      message: "Введите промокод, чтобы проверить скидку.",
    };
  }

  const promo = promoCatalog.find((item) => item.code === normalizedCode);

  if (!promo) {
    return {
      valid: false,
      code: normalizedCode,
      discountAmount: 0,
      message: "Промокод не найден. Проверьте написание или выберите акцию из доступных.",
    };
  }

  if (subtotal < promo.minSubtotal) {
    return {
      valid: false,
      code: normalizedCode,
      discountAmount: 0,
      promo,
      message: `Промокод активируется для заказов от ${promo.minSubtotal}.`,
    };
  }

  let discountAmount = 0;

  if (promo.type === "percent") {
    discountAmount = Math.round((subtotal * promo.value) / 100);
  } else if (promo.type === "fixed") {
    discountAmount = Math.min(Number(promo.value || 0), Number(subtotal || 0));
  } else if (promo.type === "free_shipping") {
    discountAmount = Math.min(Number(deliveryFee || 0), Number(deliveryFee || 0));
  }

  return {
    valid: true,
    code: normalizedCode,
    promo,
    discountAmount,
    message:
      promo.type === "free_shipping"
        ? "Промокод применён: доставка будет бесплатной."
        : `Промокод применён: ${promo.title.toLowerCase()}.`,
  };
}

export function getSizeGuide(product) {
  const category = String(product?.category || "").toLowerCase();
  const subcategory = String(product?.subcategory || "").toLowerCase();

  if (category === "shoes" || subcategory.includes("крос") || subcategory.includes("бот")) {
    return sizeGuideMap.shoes;
  }

  if (category === "clothes") {
    return sizeGuideMap.clothes;
  }

  if (category === "bags") {
    return sizeGuideMap.bags;
  }

  return null;
}

export function getProductMaterial(product) {
  const category = String(product?.category || "").toLowerCase();
  const subcategory = String(product?.subcategory || "").toLowerCase();

  if (category === "shoes" || subcategory.includes("крос") || subcategory.includes("бот")) {
    return "Дышащий текстиль, амортизирующая подошва и усиленная фиксация стопы.";
  }

  if (category === "clothes") {
    return "Смесовая спортивная ткань с мягкой посадкой и комфортом на каждый день.";
  }

  if (category === "bags") {
    return "Плотный износостойкий текстиль с практичной подкладкой и усиленными швами.";
  }

  return "Практичные спортивные материалы для повседневного использования и активного ритма.";
}
