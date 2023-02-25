import { batch, createSignal, For, JSX, onMount } from "solid-js";

export function VirtualList<T>(props: {
  data: T[];
  rowHeight: number;
  renderRow: (row: T) => JSX.Element;
  overscanCount: number;
  rootHeight: number;
  class: string;
}) {
  let rootElement: JSX.Element;
  let innerElement: JSX.Element;

  const [height, setHeight] = createSignal<number>(0);
  const [rowCount, setRowCount] = createSignal<number>(0);

  const [offset, setOffset] = createSignal<number>(0);
  const [start, setStart] = createSignal<number>(0);
  const [end, setEnd] = createSignal<number>(0);
  const [selection, setSelection] = createSignal<T[]>([]);

  // Ensure that the height of the container is always set to the offset height
  // of the root element.
  const resize = () => {
    if (height() !== rootElement.offsetHeight) {
      setHeight(rootElement.offsetHeight);
      setRowCount(getRowCount());
    }
  };

  const getStart = () => {
    let result = Number((offset() / props.rowHeight).toFixed(0));
    result = Math.max(0, result - (result % props.overscanCount));
    return result;
  };

  const getRowCount = () => {
    let result =
      Number((height() / props.rowHeight).toFixed(0)) + props.overscanCount;
    return result;
  };

  // last visible + overscan row index
  const getEnd = () => {
    let result = start() + 1 + rowCount();
    return result;
  };

  const tick = () => {
    batch(() => {
      setOffset(rootElement.scrollTop);
      setStart(getStart());
      setEnd(getEnd());
      setSelection(props.data.slice(start(), end()));
    });
  };

  const handleScroll = () => {
    if (offset() != rootElement.scrollTop) {
      tick();
    }
  };

  onMount(() => {
    resize();
    tick();
    rootElement.addEventListener("resize", resize);
  });

  const STYLE_INNER =
    "position:relative; overflow:hidden; width:100%; min-height:100%;";

  const STYLE_CONTENT =
    "position:absolute; top:0; left:0; height:100%; width:100%; overflow:visible;";

  return (
    <div
      ref={rootElement}
      style={{ overflow: "auto", height: `${props.rootHeight}px` }}
      class={props.class || ""}
      onScroll={handleScroll}
    >
      <div
        ref={innerElement}
        style={`${STYLE_INNER} height:${
          props.data.length * props.rowHeight
        }px;`}
      >
        <div style={`${STYLE_CONTENT} top:${start() * props.rowHeight}px;`}>
          <For each={selection()}>{(row) => props.renderRow(row)}</For>
        </div>
      </div>
    </div>
  );
}
