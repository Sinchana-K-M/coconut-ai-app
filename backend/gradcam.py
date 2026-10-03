import io
import base64
import numpy as np
import tensorflow as tf
from PIL import Image
import matplotlib.pyplot as plt

def find_gradcam_target_layer(model):
    """
    Safely locates MobileNetV2 base model and its final Conv layer (Conv_1).
    """
    base_model = None
    for layer in model.layers:
        if "mobilenetv2" in layer.name.lower():
            base_model = layer
            break

    if base_model is None:
        raise ValueError("MobileNetV2 base model sub-layer could not be found.")

    try:
        conv_layer = base_model.get_layer("Conv_1")
        return base_model, conv_layer
    except Exception:
        conv_layers = [l for l in base_model.layers if isinstance(l, (tf.keras.layers.Conv2D, tf.keras.layers.DepthwiseConv2D))]
        if conv_layers:
            return base_model, conv_layers[-1]
        else:
            raise ValueError("No suitable Conv2D layer found inside MobileNetV2 base model.")

def compute_raw_gradcam_heatmap(model, img_batch, raw_pred_score):
    """
    Calculates raw Grad-CAM heatmap array normalized [0, 1] using TensorFlow GradientTape.
    """
    base_model, conv_layer = find_gradcam_target_layer(model)

    sub_model = tf.keras.models.Model(
        inputs=base_model.input,
        outputs=conv_layer.output
    )

    aug_input = model.layers[1](img_batch, training=False)

    with tf.GradientTape() as tape:
        conv_outputs = sub_model(aug_input, training=False)
        tape.watch(conv_outputs)

        gap = model.layers[3](conv_outputs)
        drop = model.layers[4](gap, training=False)
        preds = model.layers[5](drop)

        score = preds[0][0]
        target_score = (1.0 - score) if raw_pred_score < 0.5 else score

    grads = tape.gradient(target_score, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs_val = conv_outputs[0]
    heatmap = conv_outputs_val @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0)

    max_val = tf.math.reduce_max(heatmap)
    if max_val > 0:
        heatmap = heatmap / max_val

    return heatmap.numpy()

def pil_to_base64(pil_img: Image.Image) -> str:
    """Converts a PIL Image to a Base64 data URL string."""
    buffer = io.BytesIO()
    pil_img.save(buffer, format="PNG")
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"

def generate_four_gradcam_views_b64(orig_pil: Image.Image, raw_heatmap_np: np.ndarray, opacity=0.45, threshold=0.4, colormap_name="jet"):
    """
    Generates 4 views and returns them as Base64 data URLs for React UI rendering:
    1. Original Image
    2. Grad-CAM Heatmap
    3. Grad-CAM Overlay
    4. Important Regions (Thresholded activation highlight)
    """
    resized_orig = orig_pil.convert("RGB").resize((224, 224), Image.Resampling.BILINEAR)
    orig_np = np.array(resized_orig)

    # Resize raw 7x7 heatmap to 224x224
    heatmap_pil_7x7 = Image.fromarray((raw_heatmap_np * 255.0).astype(np.uint8))
    heatmap_pil_224 = heatmap_pil_7x7.resize((224, 224), Image.Resampling.BILINEAR)
    heatmap_224_np = np.array(heatmap_pil_224, dtype=np.float32) / 255.0

    # 1. View 1: Original Image
    view1_orig = resized_orig

    # Select Colormap
    try:
        cmap = plt.get_cmap(colormap_name)
    except Exception:
        cmap = plt.get_cmap("jet")

    # 2. View 2: Grad-CAM Heatmap
    heatmap_colored = (cmap(heatmap_224_np)[:, :, :3] * 255).astype(np.uint8)
    view2_heatmap = Image.fromarray(heatmap_colored)

    # 3. View 3: Grad-CAM Overlay
    view3_overlay = Image.blend(resized_orig, view2_heatmap, alpha=float(opacity))

    # 4. View 4: Important Regions (Thresholded activation highlight)
    mask = (heatmap_224_np >= threshold).astype(np.float32)
    dimmed_orig = (orig_np * 0.25).astype(np.uint8)
    mask_3d = np.stack([mask] * 3, axis=-1)
    
    highlight_np = np.where(mask_3d > 0.5, (orig_np * 0.5 + heatmap_colored * 0.5).astype(np.uint8), dimmed_orig)
    view4_highlight = Image.fromarray(highlight_np)

    return {
        "view1_original": pil_to_base64(view1_orig),
        "view2_heatmap": pil_to_base64(view2_heatmap),
        "view3_overlay": pil_to_base64(view3_overlay),
        "view4_important": pil_to_base64(view4_highlight)
    }
