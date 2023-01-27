from darknet import Darknet
from utils import show_image_w_bboxes_for_server
import torch

# METHOD = 'yolo_416_coco'
METHOD = 'yolo_608_coco'

YOLOV3_WEIGHTS_PATH = '../weights/yolov3.weight'
YOLOV3_416_CFG_PATH = '../cfg/yolov3_416x416.cfg'
YOLOV3_608_CFG_PATH = '../cfg/yolov3_608x608.cfg'

if METHOD == 'yolo_608_coco':
    MODEL = Darknet(YOLOV3_608_CFG_PATH)
elif METHOD == 'yolo_416_coco':
    MODEL = Darknet(YOLOV3_416_CFG_PATH)
else:
    raise Exception(f'Undefined method: "{METHOD}"')

MODEL.load_weights(YOLOV3_WEIGHTS_PATH)
MODEL.eval()

JPG_QUALITY = 80
DEVICE = torch.device('cpu')

if __name__ == "__main__":
    show_image_w_bboxes_for_server(
        '../../public/wedding.jpg', '../../public', '../archive', '../data/coco.names', '../data/FreeSansBold.ttf', MODEL, DEVICE, 'undefined'
    )