export const getLast3Sponsors = [
  {
    $sort: {
      createdAt: -1,
    },
  },
  {
    $limit: 3,
  },
  { $unset: ["password", "__v"] },
];
