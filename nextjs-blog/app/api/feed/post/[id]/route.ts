import { NextRequest, NextResponse } from "next/server";
import {connect} from "@/dbConfig/dbConfig";
import Post from "@/models/postModel";

export async function DELETE(request: NextRequest, {params} : {params: {id: string}}) {
    try {
        await connect('feed');
        const post = await Post.findOne( {"_id": params.id});
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        await Post.deleteOne( {"_id": params.id});

        return NextResponse.json({
            message: "Post has been deleted",
            success: true
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest, {params} : {params: {id: string}}) {
    try {
        const post = await Post.findById(params.id);
        if (!post){
            return NextResponse.json({ error: "post not found" }, { status: 404 });
        }
        return NextResponse.json({ post });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// try update instead
export async function PUT(request: NextRequest) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const likes = url.searchParams.get("likes");
    // const {postID, likes} = reqBody; 
    // const thePost = await Post.findOne({ spotifyId: id });
    const thePost = await Post.findByIdAndUpdate(id, { likes }, { new: true });

    if (!thePost) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    thePost.likes = likes; 
    await thePost.save();  
    return NextResponse.json({
            message: "Like count has been updated", 
            success: true 
        }); 
} 

