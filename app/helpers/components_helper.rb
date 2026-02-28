module ComponentsHelper
  def component(name, props = {})
    tag.div(
      "",
      data: {
        react_component: name,
        props: props.to_json
      }
    )
  end
end
