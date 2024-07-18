export const getLast5Riders = [
  {
    $sort: {
      createdAt: -1,
    },
  },
  {
    $limit: 5,
  },
  { $unset: ["password", "__v"] },
];
