import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

type FileToSend = {
  id: string;
  file: File;
  error?: 'TYPE_ERROR' | 'NAME_ERROR' | 'HAS_FILE_ERROR';
};

type AlertMessage = {
  type: 'success' | 'danger';
  message: string;
};

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html'
})
export class App {
  private readonly NAME_REGEX = /^(BRBGPW00100100\d{6}_\d{10}_\d{8}|FOPAG-GOV_\d{10}_\d{6}_\d{8})$/;

  readonly ERROR_DICTIONARY: Record<string, string> = {
    TYPE_ERROR: 'O arquivo deve ser do tipo .txt',
    NAME_ERROR: 'O nome do arquivo não é válido',
    HAS_FILE_ERROR: 'O arquivo já foi adicionado',
    LIMIT_FILE_ERROR: 'O limite máximo de arquivos é 5'
  };

  showAlert = signal<AlertMessage | null>(null);
  fileList = signal<FileToSend[]>([]);
  hasFilesWithError = computed(() => this.fileList().some(f => typeof f.error !== 'undefined'));

  onFilesSelected(e: any): void {
    this.showAlert.set(null);
    const files: FileList = e.target.files;

    if (!files) return;

    if (this.fileList().length + files.length > 5) {
      this.showAlert.set({ type: 'danger', message: this.ERROR_DICTIONARY['LIMIT_FILE_ERROR'] });
      return;
    }

    Array.from(files).forEach((file: File) => {
      const fileType = file.type;
      const fileName = file.name.split('.')[0];
      const fileTemp: FileToSend = { id: crypto.randomUUID(), file };

      if (fileType !== 'text/plain') {
        fileTemp.error = 'TYPE_ERROR';
      } else if (!this.NAME_REGEX.test(fileName)) {
        fileTemp.error = 'NAME_ERROR';
      } else if (this.fileList().some(f => f.file.name === file.name)) {
        fileTemp.error = 'HAS_FILE_ERROR';
      }

      this.fileList.update(currentValues => [...currentValues, fileTemp]);
    });
  }

  onSend(): void {
    if (!this.fileList().length || this.hasFilesWithError()) return;
    const filesToSend = this.fileList().map(f => f.file);
    console.log(filesToSend);
    this.showAlert.set({ type: 'success', message: 'Os arquivos foram enviados com sucesso!' });
    this.onRefresh();
  }

  onRefresh(): void {
    this.fileList.set([]);
  }

  onRemoveFile(id: string): void {
    this.fileList.update(currentValues => currentValues.filter(f => f.id !== id));
  }

  onClose(): void {
    this.showAlert.set(null);
  }
}
