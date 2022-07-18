const paginate = (page, limit) => {
  return [
    {
      $facet: {
        meta: [
          {
            $count: 'totalResults',
          },
          {
            $addFields: {
              page: parseInt(page, 10),
              limit: parseInt(limit, 10),
            },
          },
        ],
        results: [
          {
            $skip: parseInt((page - 1) * limit, 10),
          },
          {
            $limit: parseInt(limit, 10),
          },
          {
            $addFields: {
              _id: '$_id',
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$meta',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $addFields: {
        totalPages: { $ceil: { $divide: ['$meta.totalResults', '$meta.limit'] } },
      },
    },
    {
      $project: {
        totalResults: '$meta.totalResults',
        page: '$meta.page',
        limit: '$meta.limit',
        results: '$results',
        totalPages: '$totalPages',
        _id: 0,
      },
    },
  ];
};

module.exports = paginate;
