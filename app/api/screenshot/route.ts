import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { filename, subfolder, dataUrl } = await request.json();

    const baseDir = path.join(process.cwd(), 'visual-audit');
    const dir = subfolder ? path.join(baseDir, subfolder) : baseDir;
    fs.mkdirSync(dir, { recursive: true });

    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, base64Data, 'base64');

    const size = fs.statSync(filePath).size;
    console.log(`Screenshot saved: ${subfolder}/${filename} (${(size/1024).toFixed(0)}KB)`);

    return NextResponse.json({ ok: true, path: `${subfolder}/${filename}`, size });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
