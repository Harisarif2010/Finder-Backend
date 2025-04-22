import { NextResponse } from "next/server";
import connectMongoDB from "../../../../libs/dbConnect";
import Users from "../../../../models/User";

export async function GET(req) {
  try {
    await connectMongoDB();
    const token = await getToken(req?.headers);

    // ! Get The Profile Data From The Token
    // const userData = await Users.aggregate([
    //   {
    //     $match: {
    //       _id: token?.id,
    //       email: token?.email,
    //       role: token?.role,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "users", // The collection to join (the same collection in this case)
    //       localField: "followers", // The field in the current collection
    //       foreignField: "_id", // The field in the "users" collection to match against
    //       as: "followersData", // The new array field to hold the data of followers
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "following",
    //       foreignField: "_id",
    //       as: "followingData",
    //     },
    //   },
    //   {
    //     $project: {
    //       fullName: 1,
    //       email: 1,
    //       role: 1,
    //       image: 1,
    //       gender: 1,
    //       interest: 1,
    //       businessName: 1,
    //       followersCount: { $size: "$followers" },
    //       followingCount: { $size: "$following" },
    //       // Filter followers based on matching interests and project only specific fields
    //       filteredFollowers: {
    //         $filter: {
    //           input: "$followersData",
    //           as: "follower",
    //           cond: {
    //             $gt: [
    //               {
    //                 $size: {
    //                   $setIntersection: ["$$follower.interest", "$interest"],
    //                 },
    //               },
    //               0, // If the intersection size is greater than 0, then there is a match
    //             ],
    //           },
    //         },
    //       },
    //       // Filter following based on matching interests and project only specific fields
    //       filteredFollowing: {
    //         $filter: {
    //           input: "$followingData",
    //           as: "following",
    //           cond: {
    //             $gt: [
    //               {
    //                 $size: {
    //                   $setIntersection: ["$$following.interest", "$interest"],
    //                 },
    //               },
    //               0, // If the intersection size is greater than 0, then there is a match
    //             ],
    //           },
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $project: {
    //       filteredFollowers: {
    //         $map: {
    //           input: "$filteredFollowers",
    //           as: "follower",
    //           in: {
    //             fullName: "$$follower.fullName",
    //             // email: "$$follower.email",
    //             image: "$$follower.image",
    //             location: "$$follower.location",
    //             // interest: "$$follower.interest",
    //           },
    //         },
    //       },

    //       filteredFollowing: {
    //         $map: {
    //           input: "$filteredFollowing",
    //           as: "following",
    //           in: {
    //             fullName: "$$following.fullName",
    //             // email: "$$following.email",
    //             image: "$$following.image",
    //             // interest: "$$following.interest",
    //           },
    //         },
    //       },
    //     },
    //   },
      // ]);
      





      
      // ! Get The Profile Data From The Token Also Calculate the Distance
      const userData = await Users.aggregate([
        {
          $match: {
            _id: token?.id,
            email: token?.email,
            role: token?.role,
          },
        },
        {
          $lookup: {
            from: "users", // The collection to join (the same collection in this case)
            localField: "followers", // The field in the current collection
            foreignField: "_id", // The field in the "users" collection to match against
            as: "followersData", // The new array field to hold the data of followers
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "following",
            foreignField: "_id",
            as: "followingData",
          },
        },
        {
          $project: {
            fullName: 1,
            email: 1,
            role: 1,
            image: 1,
            gender: 1,
            interest: 1,
            businessName: 1,
            followersCount: { $size: "$followers" },
            followingCount: { $size: "$following" },
            // Filter followers based on matching interests and project only specific fields
            filteredFollowers: {
              $filter: {
                input: "$followersData",
                as: "follower",
                cond: {
                  $gt: [
                    {
                      $size: {
                        $setIntersection: ["$$follower.interest", "$interest"],
                      },
                    },
                    0, // If the intersection size is greater than 0, then there is a match
                  ],
                },
              },
            },
            // Filter following based on matching interests and project only specific fields
            filteredFollowing: {
              $filter: {
                input: "$followingData",
                as: "following",
                cond: {
                  $gt: [
                    {
                      $size: {
                        $setIntersection: ["$$following.interest", "$interest"],
                      },
                    },
                    0, // If the intersection size is greater than 0, then there is a match
                  ],
                },
              },
            },
          },
        },
        // Stage to add distance calculation for followers and followings
        {
          $project: {
            filteredFollowers: {
              $map: {
                input: "$filteredFollowers",
                as: "follower",
                in: {
                  fullName: "$$follower.fullName",
                  image: "$$follower.image",
                  location: "$$follower.location",
                  distance: {
                    $let: {
                      vars: {
                        userLocation: {
                          $arrayElemAt: ["$location.coordinates", 0],
                        }, // Current user's location
                        followerLocation: "$$follower.location.coordinates",
                      },
                      in: {
                        $cond: {
                          if: {
                            $and: [
                              {
                                $ne: ["$$follower.location.coordinates", null],
                              },
                              { $ne: ["$$follower.location.coordinates", []] },
                            ],
                          },
                          then: {
                            $round: [
                              {
                                $divide: [
                                  {
                                    $multiply: [
                                      3959, // Radius of Earth in miles
                                      {
                                        $acos: {
                                          $add: [
                                            {
                                              $multiply: [
                                                {
                                                  $sin: {
                                                    $multiply: [
                                                      3.14159,
                                                      {
                                                        $divide: [
                                                          "$$userLocation",
                                                          180,
                                                        ],
                                                      },
                                                    ],
                                                  },
                                                },
                                                {
                                                  $sin: {
                                                    $multiply: [
                                                      3.14159,
                                                      {
                                                        $divide: [
                                                          "$$followerLocation",
                                                          180,
                                                        ],
                                                      },
                                                    ],
                                                  },
                                                },
                                              ],
                                            },
                                            {
                                              $multiply: [
                                                {
                                                  $cos: {
                                                    $multiply: [
                                                      3.14159,
                                                      {
                                                        $divide: [
                                                          "$$userLocation",
                                                          180,
                                                        ],
                                                      },
                                                    ],
                                                  },
                                                },
                                                {
                                                  $cos: {
                                                    $multiply: [
                                                      3.14159,
                                                      {
                                                        $divide: [
                                                          "$$followerLocation",
                                                          180,
                                                        ],
                                                      },
                                                    ],
                                                  },
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      },
                                    ],
                                  },
                                  1000, // Converts the result to meters
                                ],
                              },
                              1,
                            ],
                          },
                          else: null,
                        },
                      },
                    },
                  },
                },
              },
            },
            filteredFollowing: {
              $map: {
                input: "$filteredFollowing",
                as: "following",
                in: {
                  fullName: "$$following.fullName",
                  image: "$$following.image",
                  location: "$$following.location",
                  distance: {
                    $let: {
                      vars: {
                        userLocation: {
                          $arrayElemAt: ["$location.coordinates", 0],
                        }, // Current user's location
                        followingLocation: "$$following.location.coordinates",
                      },
                      in: {
                        $cond: {
                          if: {
                            $and: [
                              {
                                $ne: ["$$following.location.coordinates", null],
                              },
                              { $ne: ["$$following.location.coordinates", []] },
                            ],
                          },
                          then: {
                            $round: [
                              {
                                $divide: [
                                  {
                                    $multiply: [
                                      3959, // Radius of Earth in miles
                                      {
                                        $acos: {
                                          $add: [
                                            {
                                              $multiply: [
                                                {
                                                  $sin: {
                                                    $multiply: [
                                                      3.14159,
                                                      {
                                                        $divide: [
                                                          "$$userLocation",
                                                          180,
                                                        ],
                                                      },
                                                    ],
                                                  },
                                                },
                                                {
                                                  $sin: {
                                                    $multiply: [
                                                      3.14159,
                                                      {
                                                        $divide: [
                                                          "$$followingLocation",
                                                          180,
                                                        ],
                                                      },
                                                    ],
                                                  },
                                                },
                                              ],
                                            },
                                            {
                                              $multiply: [
                                                {
                                                  $cos: {
                                                    $multiply: [
                                                      3.14159,
                                                      {
                                                        $divide: [
                                                          "$$userLocation",
                                                          180,
                                                        ],
                                                      },
                                                    ],
                                                  },
                                                },
                                                {
                                                  $cos: {
                                                    $multiply: [
                                                      3.14159,
                                                      {
                                                        $divide: [
                                                          "$$followingLocation",
                                                          180,
                                                        ],
                                                      },
                                                    ],
                                                  },
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      },
                                    ],
                                  },
                                  1000, // Converts the result to meters
                                ],
                              },
                              1,
                            ],
                          },
                          else: null,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      ]);
      console.log(userData);

    return NextResponse.json(
      { message: "Profile Data Successfully Retrieved" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error While Fetching User Profile Data", err);
    return NextResponse.json(
      { error: "Error While Fetching User Profile Data" },
      { status: 400 }
    );
  }
}
