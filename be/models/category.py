from typing import List
from psycopg import AsyncConnection
from schemas.category import Category, CategoryCreate, CategoryWithChildren

async def create_category(category: CategoryCreate, db: AsyncConnection) -> Category:
    query = "INSERT INTO categories (name, parent_id) VALUES (%s, %s) RETURNING id"
    async with db.cursor() as cur:
        await cur.execute(query, (category.name, category.parent_id))
        row = await cur.fetchone()
    return Category(id=row[0], name=category.name, parent_id=category.parent_id)

async def get_all_categories(db: AsyncConnection) -> List[Category]:
    query = "SELECT id, name, parent_id FROM categories ORDER BY id"
    async with db.cursor() as cur:
        await cur.execute(query)
        rows = await cur.fetchall()
    return [Category(id=row[0], name=row[1], parent_id=row[2]) for row in rows]

async def build_category_tree(db: AsyncConnection) -> List[CategoryWithChildren]:
    query = "SELECT id, name, parent_id FROM categories"
    async with db.cursor() as cur:
        await cur.execute(query)
        rows = await cur.fetchall()
    
    all_categories = [CategoryWithChildren(id=row[0], name=row[1], parent_id=row[2], children=[]) for row in rows]
    category_map = {cat.id: cat for cat in all_categories}
    root_categories = []

    for cat in all_categories:
        if cat.parent_id is None:
            root_categories.append(cat)
        else:
            parent = category_map.get(cat.parent_id)
            if parent:
                parent.children.append(cat)
    
    return root_categories

async def get_category_tree(db: AsyncConnection) -> List[CategoryWithChildren]:
    return await build_category_tree(db)
