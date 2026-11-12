import { NextResponse } from 'next/server';
import { getStations, updateStation, getSystemConfig, updateSystemConfig } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stations = getStations();
    const systemConfig = getSystemConfig();
    return NextResponse.json({ stations, systemConfig });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();

    if (body.type === 'station') {
      const updated = updateStation(body.stationId, body.updates);
      return NextResponse.json({ message: 'Station updated', station: updated });
    }

    if (body.type === 'config') {
      const updated = updateSystemConfig(body.config);
      return NextResponse.json({ message: 'System configuration updated', config: updated });
    }

    return NextResponse.json({ error: 'Invalid update type' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

