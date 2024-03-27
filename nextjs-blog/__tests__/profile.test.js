// import { TextEncoder, TextDecoder } from 'text-encoding';
import { NextRequest, NextResponse } from "next/server";
import { POST, PUT } from "@/app/api/users/profile/route"; 
import User from "@/models/UserModel";

// Mock the NextRequest and NextResponse modules
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn()
  }
}));

describe("POST function", () => {
  test("adds a new user", async () => {
    // Mock request body
    const reqBody = {
      method: "addUser",
      body: {
        spotifyId: "someId",
        username: "someUsername",
        followers: [],
        following: []
      }
    };

    // Mock request object
    const request = new NextRequest();
    request.json = jest.fn().mockResolvedValue(reqBody);

    // Mock existing user check
    const existingUser = null; // Mock that no user exists

    // Mock User model methods
    const findOneMock = jest.spyOn(User, "findOne").mockResolvedValue(existingUser);
    const saveMock = jest.spyOn(User.prototype, "save").mockResolvedValue({});

    // Call the POST function with the mock request object
    await POST(request);

    // Add your assertions here to verify the behavior of the POST function
    expect(findOneMock).toHaveBeenCalledWith({ spotifyId: reqBody.body.spotifyId });
    expect(saveMock).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith({
      message: "User created successfully",
      success: true,
      savedUser: {}
    });
  });
});

describe("PUT function", () => {
  describe("addFollowing action", () => {
    test("adds a new following user", async () => {
      const reqBody = {
        action: "addFollowing",
        spotifyId: "someId",
        followUserId: "someOtherId"
      };

      const request = new NextRequest();
      request.json = jest.fn().mockResolvedValue(reqBody);

      const user = { following: [] };
      const followUser = { spotifyId: reqBody.followUserId };
      const findOneUserMock = jest.spyOn(User, "findOne").mockResolvedValue(user);
      const findOneFollowUserMock = jest.spyOn(User, "findOne").mockResolvedValue(followUser);
      const saveMock = jest.spyOn(User.prototype, "save").mockResolvedValue({});

      await PUT(request);

      expect(findOneUserMock).toHaveBeenCalledWith({ spotifyId: reqBody.spotifyId });
      expect(findOneFollowUserMock).toHaveBeenCalledWith({ spotifyId: reqBody.followUserId });
      expect(user.following.includes(reqBody.followUserId)).toBe(false);
      expect(saveMock).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith({
        message: "User created successfully",
        success: true,
        savedUser: {} 
      });
    });
  });
  describe("addFollower action", () => {
    test("adds a new follower user", async () => {
        const reqBody = {
            action: "addFollower",
            spotifyId: "someId",
            followUserId: "someOtherId"
        };

        const request = new NextRequest();
        request.json = jest.fn().mockResolvedValue(reqBody);

        const user = { followers: [] };
        const followUser = { spotifyId: reqBody.followUserId };

        const findOneUserMock = jest.spyOn(User, "findOne").mockResolvedValue(user);
        const findOneFollowUserMock = jest.spyOn(User, "findOne").mockResolvedValue(followUser);
        const saveMock = jest.spyOn(User.prototype, "save").mockResolvedValue({});

        await PUT(request);

        expect(findOneUserMock).toHaveBeenCalledWith({ spotifyId: reqBody.spotifyId });
        expect(findOneFollowUserMock).toHaveBeenCalledWith({ spotifyId: reqBody.followUserId });
        expect(user.followers.includes(reqBody.followUserId)).toBe(false); 
        expect(saveMock).toHaveBeenCalled();
        expect(NextResponse.json).toHaveBeenCalledWith({
          message: "User created successfully",
          success: true,
          savedUser: {} 
      });
    });
  });
  test("handles invalid action", async () => {
    const reqBody = {
      action: "invalidAction",
      spotifyId: "someId",
      followUserId: "someOtherId"
    };

    const request = new NextRequest();
    request.json = jest.fn().mockResolvedValue(reqBody);

    await PUT(request);

    expect(NextResponse.json).toHaveBeenCalledWith({
      error: "Invalid action"
    }, {
      status: 400
    });
  });
});