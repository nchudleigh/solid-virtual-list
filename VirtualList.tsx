import { createSignal, For, JSX, onMount } from "solid-js";

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

  const [offset, setOffset] = createSignal(0);
  const [height, setHeight] = createSignal(0);

  // Ensure that the height of the container is always set to the offset height
  // of the root element.
  const resize = () => {
    if (height() !== rootElement.offsetHeight)
      setHeight(rootElement.offsetHeight);
  };

  const start = () => {
    let result = offset() / props.rowHeight;
    result = Math.max(0, result - (result % props.overscanCount));

    return result;
  };

  const visibleRowCount = () => {
    let result = height() / props.rowHeight + props.overscanCount;
    return result;
  };

  // last visible + overscan row index
  const end = () => {
    let result = start() + 1 + visibleRowCount();
    return result;
  };

  const handleScroll = () => {
    setOffset(rootElement.scrollTop);
  };

  const selection = () => {
    return props.data.slice(start(), end());
  };

  onMount(() => {
    resize();
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
