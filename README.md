# Physics Math

This provides functions to support physics education, providing a library of functions to describe
typical physics homework situations, together with their derivatives and integrals. Quantities and
functions are tagged with units. Values and functions display with suitable mathematical notation.

The ultimate goal is to build an interactive environment where a student can explore and build
an intuitive understanding of the mathematical relationships and their correspondence to familiar
physical reality, rather than memorize formula.

The use of sin/cos etc. is discouraged in favor of building on vectors, as was worked out by
Heavyside et al 139 years ago. That students are still often taught clumsy sin/cos rather than
dot and cross products is a disgrace; the result is barriers to clear and intuitive understanding,
and the impression that physics is more complex than the reality it describes.

One does not even escape the use of vectors; once you hit rotation and torque, they pop up anyway.

Rotation and orientation are represented as quaternions. This is most suitable for representing
Newtonian physics, the pedagogy may favor the more general affine transform approach. However,
rotation matricies can easily be presented from underlying quaternions. Still, the simplicity
and limited scope of quaternions may win out.

This is presently targeted at building examples on ObservableHQ. For current examples of the
work-in-progress, see
[the ObservableHQ Test Page](https://observablehq.com/@bobkerns/testing-physics-math)

See the documentation at https://bobkerns.github.io/physics-math/docs/index.html (still a work in progress).

Home: https://bobkerns.github.io/physics-math/

See the [CHANGELOG](./CHANGELOG.md).
