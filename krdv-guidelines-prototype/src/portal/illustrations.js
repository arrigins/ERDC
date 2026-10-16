// Библиотека иллюстраций для карточек: объёмные иконки от дизайн-команды (PNG с прозрачностью → WebP).
// Сгруппированы по смыслу, чтобы выбирать из короткого ряда, а не из длинного списка.

import { asset } from "./photo.js";

export const illustrationGroups = [
  {
    id: "talk",
    title: "Общение",
    items: [
      { id: "01", title: "Лайк и сердечки" },
      { id: "03", title: "Сердце" },
      { id: "05", title: "Диалог с сердцем" },
      { id: "02", title: "Диалог" },
      { id: "11", title: "Вопросы" },
      { id: "04", title: "Рупор" },
    ],
  },
  {
    id: "important",
    title: "Важное",
    items: [
      { id: "08", title: "Восклицательный знак" },
      { id: "07", title: "Восклицательный знак, синий" },
      { id: "15", title: "Внимание" },
      { id: "10", title: "Молния" },
      { id: "14", title: "Галочка" },
    ],
  },
  {
    id: "time",
    title: "Место и время",
    items: [
      { id: "16", title: "Календарь" },
      { id: "13", title: "Часы" },
      { id: "12", title: "Геометка" },
    ],
  },
  {
    id: "docs",
    title: "Документы",
    items: [
      { id: "17", title: "Документ" },
      { id: "18", title: "Документы" },
      { id: "09", title: "Папка" },
    ],
  },
];

export const illustrationSrc = (id) => asset(`assets/portal/illustrations/il-${id}.webp`);
export const illustrationById = (id) => illustrationGroups.flatMap((group) => group.items).find((item) => item.id === id);
export const groupOf = (id) => illustrationGroups.find((group) => group.items.some((item) => item.id === id)) || illustrationGroups[0];
