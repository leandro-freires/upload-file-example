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

  private _fileList = signal<FileToSend[]>([]);

  private _showAlert = signal<AlertMessage | null>(null);

  readonly fileList = this._fileList.asReadonly();

  readonly showAlert = this._showAlert.asReadonly();

  hasFilesWithError = computed(() => this.fileList().some(f => typeof f.error !== 'undefined'));

  onFilesSelected(e: any): void {
    this.addAlertMessage(null);
    const files: FileList = e.target.files;

    if (!files) return;

    if (this.fileList().length + files.length > 5) {
      this.addAlertMessage({ type: 'danger', message: this.ERROR_DICTIONARY['LIMIT_FILE_ERROR'] });
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

      this.addFileToSend(fileTemp);
    });
  }

  addFileToSend(file: FileToSend): void {
    this._fileList.update(currentValues => [...currentValues, file]);
  }

  addAlertMessage(alertMessage: AlertMessage | null): void {
    this._showAlert.set(alertMessage);
  }

  onSend(): void {
    if (!this.fileList().length || this.hasFilesWithError()) return;
    const filesToSend = this.fileList().map(f => f.file);
    console.log(filesToSend);
    this.addAlertMessage({ type: 'success', message: 'Os arquivos foram enviados com sucesso!' });
    this.onRefresh();
  }

  onRefresh(): void {
    this._fileList.set([]);
  }

  onRemoveFile(id: string): void {
    this._fileList.update(currentValues => currentValues.filter(f => f.id !== id));
  }

  onClose(): void {
    this.addAlertMessage(null);
  }
}
