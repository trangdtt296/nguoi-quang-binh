"use client";

import { ResourceEditor } from "@/components/admin/resource-editor";
import { AlbumForm } from "@/components/admin/album-form";
import type { AdminAlbum } from "@/lib/admin/types";

export default function EditAlbumPage() {
  return (
    <ResourceEditor<AdminAlbum> endpoint="/admin/albums" noun="album">
      {(album) => <AlbumForm key={album.id} album={album} />}
    </ResourceEditor>
  );
}
