import { Component, Input, OnInit } from '@angular/core';
import Drawflow, { DrawFlowEditorMode } from 'drawflow';
import { decisionNodeHtml, defaultEmptyData, endNodeHtml, multiNodeHtml, startNodeHtml } from './tundra-flow.constants';

@Component({
  selector: 'tundra-flow-graph',
  templateUrl: './tundra-flow.component.html',
  styleUrl: './tundra-flow.component.scss',
})
export class TundraFlowComponent implements OnInit {

  @Input() locked: boolean = false;

  editor!: Drawflow;
  editDivHtml!: HTMLElement;
  editButtonShown: boolean = false;

  drawnNodes: any[] = [];
  selectedNodeId: string = "";
  selectedNode: any = {};

  lastMousePositionEv: any;

  mobile_item_select: string = "";
  mobile_last_move?: TouchEvent | null;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.initDrawingBoard();
  }

  private initDrawingBoard() {
    this.initDrawFlow();
    if (!this.locked) {
      this.addEditorEvents();
      this.dragEvent();
    }
  }

  // Private functions
  private initDrawFlow(): void {
    if (typeof document !== 'undefined') {
      const drawFlowHtmlElement = document.getElementById('drawflow');
      this.editor = new Drawflow(drawFlowHtmlElement as HTMLElement);

      this.editor.reroute = true;
      this.editor.curvature = 0.5;
      this.editor.reroute_fix_curvature = true;
      this.editor.reroute_curvature = 0.5;
      this.editor.force_first_input = false;
      this.editor.line_path = 1;
      this.editor.editor_mode = 'edit';

      this.editor.start();

      // to tester, load draw
      const dataToImport = defaultEmptyData;
      this.editor.import(dataToImport);
    }
  }

  private addEditorEvents() {
    // Events!
    this.editor.on('nodeCreated', (id: any) => {
      console.log('Editor Event :>> Node created ' + id, this.editor.getNodeFromId(id));
    });

    this.editor.on('nodeRemoved', (id: any) => {
      console.log('Editor Event :>> Node removed ' + id);
    });

    this.editor.on('nodeSelected', (id: any) => {
      console.log('Editor Event :>> Node selected ' + id, this.editor.getNodeFromId(id));
      this.selectedNode = this.editor.drawflow.drawflow.Home.data[`${id}`];
      console.log('Editor Event :>> Node selected :>> this.selectedNode :>> ', this.selectedNode);
      console.log('Editor Event :>> Node selected :>> this.selectedNode :>> ', this.selectedNode.data);
    });

    this.editor.on('click', (e: any) => {
      console.log('Editor Event :>> Click :>> ', e);

      if (e.target.closest('.drawflow_content_node') != null || e.target.classList[0] === 'drawflow-node') {
        if (e.target.closest('.drawflow_content_node') != null) {
          this.selectedNodeId = e.target.closest('.drawflow_content_node').parentElement.id;
        } else {
          this.selectedNodeId = e.target.id;
        }
        this.selectedNode = this.editor.drawflow.drawflow.Home.data[`${this.selectedNodeId.slice(5)}`];
      }

      if (e.target.closest('#editNode') != null || e.target.classList[0] === 'edit-node-button') {
        // Open modal with Selected Node
        // this.open(this.nodeModal, this.selectedNodeId);
      }
    });

    this.editor.on('moduleCreated', (name: any) => {
      console.log('Editor Event :>> Module Created ' + name);
    });

    this.editor.on('moduleChanged', (name: any) => {
      console.log('Editor Event :>> Module Changed ' + name);
    });

    this.editor.on('connectionCreated', (connection: any) => {
      console.log('Editor Event :>> Connection created ', connection);
    });

    this.editor.on('connectionRemoved', (connection: any) => {
      console.log('Editor Event :>> Connection removed ', connection);
    });

    this.editor.on('zoom', (zoom: any) => {
      console.log('Editor Event :>> Zoom level ' + zoom);
    });

    this.editor.on('addReroute', (id: any) => {
      console.log('Editor Event :>> Reroute added ' + id);
    });

    this.editor.on('removeReroute', (id: any) => {
      console.log('Editor Event :>> Reroute removed ' + id);
    });

    // This is firing
    this.editor.on('mouseMove', (position: any) => {
      //console.log('Editor Event :>> Position mouse x:' + position.x + ' y:' + position.y);
    });

    this.editor.on('nodeMoved', (id: any) => {
      console.log('Editor Event :>> Node moved ' + id);
    });

    this.editor.on('translate', (position: any) => {
      console.log(
        'Editor Event :>> Translate x:' + position.x + ' y:' + position.y
      );
    });

    this.editor.on('connectionSelected', (connection: any) => {
      console.log(connection);
    });
  }

  private dragEvent() {
    var elements = Array.from(document.getElementsByClassName('drag-drawflow'));

    elements.forEach(element => {
      element.addEventListener('touchend', this.drop.bind(this), false);
      element.addEventListener('touchmove', this.positionMobile.bind(this), false);
      element.addEventListener('touchstart', this.drag.bind(this), false);
      element.addEventListener("dblclick", (event) => { });
    });

  }

  private positionMobile(ev: any) {
    this.mobile_last_move = ev;
  }

  public allowDrop(ev: any) {
    ev.preventDefault();
  }

  drag(ev: any) {
    if (ev.type === "touchstart") {
      this.selectedNode = ev.target.closest(".drag-drawflow").getAttribute('data-node');
    } else {
      ev.dataTransfer.setData("node", ev.target.getAttribute('data-node'));
    }
  }

  drop(ev: any) {
    if (ev.type === "touchend" && this.mobile_last_move) {
      var parentdrawflow = document.elementFromPoint(this.mobile_last_move.touches[0].clientX, this.mobile_last_move.touches[0].clientY)?.closest("#drawflow");
      if (parentdrawflow != null) {
        this.addNodeToDrawFlow(this.mobile_item_select, this.mobile_last_move.touches[0].clientX, this.mobile_last_move.touches[0].clientY);
      }
      this.mobile_item_select = '';
    } else {
      ev.preventDefault();
      var data = ev.dataTransfer.getData("node");
      this.addNodeToDrawFlow(data, ev.clientX, ev.clientY);
    }
  }

  private addNodeToDrawFlow(name: string, pos_x: number, pos_y: number) {

    const test = this.editor as Drawflow;

    if (this.editor.editor_mode === 'fixed') {
      return false;
    }

    pos_x = pos_x * (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom)) - (this.editor.precanvas.getBoundingClientRect().x * (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom)));
    pos_y = pos_y * (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom)) - (this.editor.precanvas.getBoundingClientRect().y * (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom)));

    switch (name) {
      case 'startNode':
        this.editor.addNode('startNode', 0, 1, pos_x, pos_y, 'startNode', {}, startNodeHtml, false);
        break;
      case 'endNode':
        this.editor.addNode('endNode', 1, 0, pos_x, pos_y, 'endNode', {}, endNodeHtml, false);
        break;
      case 'decisionNode':
        this.editor.addNode('decisionNode', 1, 1, pos_x, pos_y, 'decisionNode', { "template": 'Write your decision' }, decisionNodeHtml, false);
        break;
      case 'multiNode':
        this.editor.addNode('multiNode', 3, 4, pos_x, pos_y, 'multiNode', {}, multiNodeHtml, false);
        break;
      default:
    }

    return true;
  }

  export() {
    const html = JSON.stringify(this.editor.export(), null, 4)
  }

  onClear() {
    this.editor.clear();
  }

  changeMode() {
    this.locked = !this.locked;
    this.editor.editor_mode = this.locked != null && this.locked == false ? 'edit' : 'fixed';
  }

  onZoomOut() {
    this.editor.zoom_out();
  }

  onZoomIn() {
    this.editor.zoom_in();
  }

  onZoomReset() {
    this.editor.zoom_reset();
  }

  exportDrawingData() {
    return this.editor.export();
  }

}
