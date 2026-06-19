import torch
import torch.nn as nn
from torchvision import models

# ── DoubleConv untuk U-Net ───────────────────────────────────────────────────
class DoubleConv(nn.Module):
    def __init__(self, in_channels: int, out_channels: int):
        super(DoubleConv, self).__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.conv(x)


# ── Arsitektur U-Net ─────────────────────────────────────────────────────────
class UNet(nn.Module):
    def __init__(self, in_channels: int = 3, out_channels: int = 4):
        super(UNet, self).__init__()
        
        # Encoder
        self.down1 = DoubleConv(in_channels, 64)
        self.pool1 = nn.MaxPool2d(kernel_size=2, stride=2)
        
        self.down2 = DoubleConv(64, 128)
        self.pool2 = nn.MaxPool2d(kernel_size=2, stride=2)
        
        self.down3 = DoubleConv(128, 256)
        self.pool3 = nn.MaxPool2d(kernel_size=2, stride=2)
        
        self.down4 = DoubleConv(256, 512)
        self.pool4 = nn.MaxPool2d(kernel_size=2, stride=2)
        
        # Bottleneck
        self.bottleneck = DoubleConv(512, 1024)
        
        # Decoder
        self.upconv4 = nn.ConvTranspose2d(1024, 512, kernel_size=2, stride=2)
        self.up4 = DoubleConv(1024, 512)
        
        self.upconv3 = nn.ConvTranspose2d(512, 256, kernel_size=2, stride=2)
        self.up3 = DoubleConv(512, 256)
        
        self.upconv2 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
        self.up2 = DoubleConv(256, 128)
        
        self.upconv1 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.up1 = DoubleConv(128, 64)
        
        # Output layer
        self.out_conv = nn.Conv2d(64, out_channels, kernel_size=1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Encoder
        d1 = self.down1(x)
        x = self.pool1(d1)
        
        d2 = self.down2(x)
        x = self.pool2(d2)
        
        d3 = self.down3(x)
        x = self.pool3(d3)
        
        d4 = self.down4(x)
        x = self.pool4(d4)
        
        # Bottleneck
        x = self.bottleneck(x)
        
        # Decoder + Skip Connections
        x = self.upconv4(x)
        x = torch.cat([x, d4], dim=1)
        x = self.up4(x)
        
        x = self.upconv3(x)
        x = torch.cat([x, d3], dim=1)
        x = self.up3(x)
        
        x = self.upconv2(x)
        x = torch.cat([x, d2], dim=1)
        x = self.up2(x)
        
        x = self.upconv1(x)
        x = torch.cat([x, d1], dim=1)
        x = self.up1(x)
        
        return self.out_conv(x)


# ── Arsitektur ViT Klasifikasi ───────────────────────────────────────────────
class ViTSkripsi(nn.Module):
    def __init__(self, num_classes: int = 3):
        super(ViTSkripsi, self).__init__()
        
        # Gunakan weights=None agar tidak mendownload bobot default ImageNet dari Google
        # Karena kita akan langsung me-load model hasil training (.pth) secara lokal.
        vit_pretrained = models.vit_b_16(weights=None)
        
        self.patch_embed = vit_pretrained.conv_proj 
        self.class_token = vit_pretrained.class_token
        self.pos_embedding = vit_pretrained.encoder.pos_embedding
        self.transformer_encoder = vit_pretrained.encoder
        
        emb_size = 768  # Dimensi standar ViT Base
        self.mlp_head = nn.Sequential(
            nn.LayerNorm(emb_size),
            nn.Linear(emb_size, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # 1. Pemotongan Patch (16x16)
        x = self.patch_embed(x) 
        x = x.flatten(2).transpose(1, 2)
        
        # 2. Sisipkan Token [CLS] dan Posisi
        b = x.shape[0]
        batch_class_token = self.class_token.expand(b, -1, -1)
        x = torch.cat([batch_class_token, x], dim=1)
        x = x + self.pos_embedding
        
        # 3. Proses Transformer Encoder
        x = self.transformer_encoder(x)
        
        # 4. Ambil kesimpulan dari Token [CLS]
        cls_output = x[:, 0]
        
        return self.mlp_head(cls_output)
