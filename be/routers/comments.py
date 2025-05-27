from typing import List
from fastapi import APIRouter, Depends, HTTPException
from psycopg import AsyncConnection
from schemas.comments import CommentCreate, CommentResponse
from models.comment import create_comment, get_comment_by_product, delete_comment
from models.database import get_connection

router = APIRouter(tags=["Comments"])

@router.post("/comments/add", response_model=CommentResponse)
async def create_comment_route(payload: CommentCreate, db: AsyncConnection = Depends(get_connection),):
    comment = await create_comment(db, payload)
    if not comment:
        raise HTTPException(status_code=404, detail="Error")
    return comment

@router.get("/comment/{product_id}", response_model=List[CommentResponse])
async def get_commnets_product(product_id : int, db : AsyncConnection = Depends(get_connection)):
    comments = await get_comment_by_product(db, product_id)
    return comments

@router.delete("/comment/delete/{comment_id}")
async def delete_cmt(comment_id : int, db: AsyncConnection = Depends(get_connection)):
    await delete_comment(db, comment_id)
    return {"message":"Done deleted"}