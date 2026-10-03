---
oj: dmy
pid: '411'
title: '[R66C] 打怪'
difficulty: 入门
tags:
  - 排序
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$1 \le s, t_i, x_i \le 10^9$，$1 \le y_i \le 10^4$，所有 $t_i$ 互不相同且**不保证递增**。

## 思路

怪物是否能被击败，取决于它**出现那一刻** `jiangly` 的战斗力，因此必须按时间先后顺序处理，而不是按输入顺序处理。

将每个怪物存成三元组 $(t_i, x_i, y_i)$，按 $t_i$ 从小到大排序后依次扫描：

- 若当前战斗力 $s \ge x_i$，击败它，$s \mathrel{+}= y_i$；
- 否则战斗力不变。

题目保证所有 $t_i$ 互不相同，排序后不存在同一时刻的处理顺序问题。复杂度：时间 $O(n \log n)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

class Monster <: Comparable<Monster> {
    let t: Int64
    let x: Int64
    let y: Int64
    init(t: Int64, x: Int64, y: Int64) {
        this.t = t
        this.x = x
        this.y = y
    }
    public func compare(that: Monster): Ordering {
        if (t < that.t) {
            return Ordering.LT
        } else if (t > that.t) {
            return Ordering.GT
        } else {
            return Ordering.EQ
        }
    }
}

main() {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line[0]
    var s = line[1]
    var monsters = Array<Monster>(n, { _ => Monster(0, 0, 0) })
    for (i in 0..n) {
        let l = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        monsters[i] = Monster(l[0], l[1], l[2])
    }
    sort(monsters)
    for (i in 0..n) {
        let m = monsters[i]
        if (s >= m.x) {
            s += m.y
        }
    }
    println(s)
}
```

</details>

## 要点

- **必须按时间排序**：题目明确说 $t_i$ 不保证递增，按输入顺序模拟会得到错误答案（例如样例中时刻 $2$ 的怪物排在时刻 $3$ 之后）。
- 自定义 `Monster` 类实现 `Comparable<Monster>` 接口，只按 $t$ 比较，这样可以直接调用全局 `sort(monsters)` 完成排序。
- 读入用 `split(" ", removeEmpty: true)` 过滤行尾多余空格，避免 `Int64.parse("")` 抛异常。
