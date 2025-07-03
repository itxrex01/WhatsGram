const axios = require('axios');
const fs = require('fs');
const QRCode = require('qrcode');
const FormData = require('form-data');

class Utils {
  // URL Shortener
  static async shortenUrl(url) {
    try {
      const response = await axios.get(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
      return response.data.shorturl || 'Failed to shorten URL';
    } catch (error) {
      return 'Failed to shorten URL';
    }
  }

  // QR Code Generator
  static async generateQR(text) {
    try {
      const qr = await QRCode.toDataURL(text);
      return { status: true, qr: qr.split(',')[1] };
    } catch (error) {
      return { status: false, msg: 'Failed to generate QR code' };
    }
  }

  // QR Code Reader
  static async readQR(imageData) {
    try {
      const form = new FormData();
      form.append('file', Buffer.from(imageData.data, 'base64'), {
        filename: `qr.${imageData.mimetype.split('/').pop()}`
      });
      
      const response = await axios.post('http://api.qrserver.com/v1/read-qr-code/', form, {
        headers: form.getHeaders()
      });
      
      return { status: true, data: response.data[0].symbol[0].data };
    } catch (error) {
      return { status: false };
    }
  }

  // Carbon Code Image Generator
  static async generateCarbon(code) {
    try {
      const url = `https://unofficialcarbon.herokuapp.com/api/?text=${encodeURIComponent(code)}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const base64Data = Buffer.from(response.data, 'binary').toString('base64');
      
      return {
        mimetype: 'image/png',
        data: base64Data,
        name: 'carbon'
      };
    } catch (error) {
      throw new Error('Failed to generate carbon image');
    }
  }

  // Telegraph Upload
  static async uploadToTelegraph(mediaData) {
    try {
      const form = new FormData();
      form.append('file', Buffer.from(mediaData.data, 'base64'), {
        filename: `Telegraph.${mediaData.mimetype.split('/').pop()}`
      });
      
      const response = await axios.post('https://telegra.ph/upload', form, {
        headers: form.getHeaders()
      });
      
      return { status: true, url: `https://telegra.ph${response.data[0].src}` };
    } catch (error) {
      return { status: false };
    }
  }

  // Remove Background
  static async removeBackground(base64Image, apiKey) {
    try {
      const { removeBackgroundFromImageBase64 } = require('remove.bg');
      const result = await removeBackgroundFromImageBase64({
        base64img: base64Image,
        apiKey: apiKey,
        size: 'regular'
      });
      return { status: true, img: result.base64img };
    } catch (error) {
      return { status: false, error: error.message };
    }
  }

  // OCR Text Extraction
  static async extractText(imageData, apiKey) {
    try {
      const ocrSpace = require('ocr-space-api-wrapper');
      const result = await ocrSpace(`data:image/png;base64,${imageData}`, { apiKey });
      const extractedText = result.ParsedResults[0].ParsedText;
      return `Here is the extracted text:\n\n${extractedText}`;
    } catch (error) {
      return 'Failed to extract text. Make sure you passed a valid image.';
    }
  }

  // File Size Checker
  static checkFileSize(sizeString, maxSizeMB = 100) {
    const [size, unit] = sizeString.split(' ');
    if (unit === 'MB' && parseInt(size) > maxSizeMB) {
      return false;
    }
    return true;
  }

  // Time Parser for Mute
  static parseTime(timeString) {
    if (timeString === 'forever' || !timeString) {
      return new Date('December 17, 1995 03:24:00');
    }

    const mins = timeString.includes('m') ? parseInt(timeString.split('m')[0].split(' ').pop()) * 60 : 0;
    const hrs = timeString.includes('h') ? parseInt(timeString.split('h')[0].split(' ').pop()) * 60 * 60 : 0;
    const days = timeString.includes('d') ? parseInt(timeString.split('d')[0].split(' ').pop()) * 60 * 60 * 24 : 0;
    const weeks = timeString.includes('w') ? parseInt(timeString.split('w')[0].split(' ').pop()) * 60 * 60 * 24 * 7 : 0;

    const unmuteTime = new Date();
    unmuteTime.setSeconds(unmuteTime.getSeconds() + mins + hrs + days + weeks);
    return unmuteTime;
  }

  // Media Type Detector
  static getMediaType(message) {
    if (message.type === 'image') return 'image';
    if (message.type === 'video') return 'video';
    if (message.type === 'audio') return 'audio';
    if (message.type === 'ptt') return 'voice';
    if (message.type === 'document') return 'document';
    return 'text';
  }

  // Format File Size
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Validate URL
  static isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Clean Phone Number
  static cleanPhoneNumber(number) {
    return number.replace(/[^\d]/g, '');
  }

  // Format Duration
  static formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
}

module.exports = Utils;