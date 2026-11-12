import { NextResponse } from 'next/server';
import { 
  getMenu, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem, 
  getCategories, 
  addCategory 
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const menu = getMenu();
    const categories = getCategories();
    return NextResponse.json({ menu, categories });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (body.type === 'category') {
      const added = addCategory(body.name);
      return NextResponse.json({ success: added, categories: getCategories() });
    }

    const newItem = createMenuItem(body);
    return NextResponse.json({ message: 'Menu item created successfully', item: newItem }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, updates, ...rest } = body;
    const finalUpdates = updates || rest;

    if (!id) {
      return NextResponse.json({ error: 'Menu item ID is required' }, { status: 400 });
    }

    const updated = updateMenuItem(id, finalUpdates);
    if (!updated) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Menu item updated', item: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Menu item ID is required' }, { status: 400 });
    }

    const success = deleteMenuItem(id);
    if (!success) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Menu item deleted' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
